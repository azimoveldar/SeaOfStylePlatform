#########################################
# Networking Module (VPC + Subnets + NAT)
#########################################

########################
# Local naming helpers #
########################
locals {
  # Base tags applied to all resources
  base_tags = merge(var.tags, {
    Project = var.project
    Suffix  = var.name_suffix
  })

  # Doc naming + your suffix rule (append 9)
  name = {
    vpc = "${var.project}-vpc${var.name_suffix}"
    igw = "${var.project}-igw${var.name_suffix}"

    public_subnet_a = "${var.project}-public-az-a${var.name_suffix}"
    public_subnet_b = "${var.project}-public-az-b${var.name_suffix}"

    private_subnet_a = "${var.project}-private-app-az-a${var.name_suffix}"
    private_subnet_b = "${var.project}-private-app-az-b${var.name_suffix}"

    nat_a = "${var.project}-nat-az-a${var.name_suffix}"
    nat_b = "${var.project}-nat-az-b${var.name_suffix}"

    public_rt    = "${var.project}-public-rt${var.name_suffix}"
    private_rt_a = "${var.project}-private-rt-az-a${var.name_suffix}"
    private_rt_b = "${var.project}-private-rt-az-b${var.name_suffix}"

    lambda_sg   = "${var.project}-lambda-sg${var.name_suffix}"
    endpoint_sg = "${var.project}-vpc-endpoint-sg${var.name_suffix}"
  }
}

#########################
# 1) VPC (10.0.0.0/16)  #
#########################
resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(local.base_tags, {
    Name = local.name.vpc
  })
}

################################
# 2) Internet Gateway (Public) #
################################
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.base_tags, {
    Name = local.name.igw
  })
}

#########################################
# 3) Public Subnets (2 AZs, auto public IP)
#########################################
resource "aws_subnet" "public_a" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[0]
  availability_zone       = var.azs[0]
  map_public_ip_on_launch = true

  tags = merge(local.base_tags, {
    Name = local.name.public_subnet_a
    Tier = "public"
  })
}

resource "aws_subnet" "public_b" {
  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnet_cidrs[1]
  availability_zone       = var.azs[1]
  map_public_ip_on_launch = true

  tags = merge(local.base_tags, {
    Name = local.name.public_subnet_b
    Tier = "public"
  })
}

#########################################
# 4) Private Subnets (2 AZs, for Lambda) #
#########################################
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnet_cidrs[0]
  availability_zone = var.azs[0]

  tags = merge(local.base_tags, {
    Name = local.name.private_subnet_a
    Tier = "private"
  })
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnet_cidrs[1]
  availability_zone = var.azs[1]

  tags = merge(local.base_tags, {
    Name = local.name.private_subnet_b
    Tier = "private"
  })
}

####################################################
# 5) NAT Gateways (2 NATs for HA, one per public AZ)
####################################################
# Elastic IP for NAT in AZ-a
resource "aws_eip" "nat_a" {
  domain = "vpc"

  tags = merge(local.base_tags, {
    Name = "${local.name.nat_a}-eip"
  })
}

# Elastic IP for NAT in AZ-b
resource "aws_eip" "nat_b" {
  domain = "vpc"

  tags = merge(local.base_tags, {
    Name = "${local.name.nat_b}-eip"
  })
}

# NAT Gateway in public subnet AZ-a
resource "aws_nat_gateway" "a" {
  allocation_id = aws_eip.nat_a.id
  subnet_id     = aws_subnet.public_a.id
  depends_on    = [aws_internet_gateway.this] # ensure IGW exists first

  tags = merge(local.base_tags, {
    Name = local.name.nat_a
  })
}

# NAT Gateway in public subnet AZ-b
resource "aws_nat_gateway" "b" {
  allocation_id = aws_eip.nat_b.id
  subnet_id     = aws_subnet.public_b.id
  depends_on    = [aws_internet_gateway.this]

  tags = merge(local.base_tags, {
    Name = local.name.nat_b
  })
}

#########################################
# 6) Route Tables (public + private x2) #
#########################################

# Public route table: route 0.0.0.0/0 -> IGW
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.base_tags, {
    Name = local.name.public_rt
  })
}

resource "aws_route" "public_internet" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

# Associate both public subnets to public RT
resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

# Private RT AZ-a: route 0.0.0.0/0 -> NAT AZ-a
resource "aws_route_table" "private_a" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.base_tags, {
    Name = local.name.private_rt_a
  })
}

resource "aws_route" "private_a_nat" {
  route_table_id         = aws_route_table.private_a.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.a.id
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private_a.id
}

# Private RT AZ-b: route 0.0.0.0/0 -> NAT AZ-b
resource "aws_route_table" "private_b" {
  vpc_id = aws_vpc.this.id

  tags = merge(local.base_tags, {
    Name = local.name.private_rt_b
  })
}

resource "aws_route" "private_b_nat" {
  route_table_id         = aws_route_table.private_b.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.b.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private_b.id
}

##############################################
# 7) Security Groups (Lambda SG + Endpoint SG)
##############################################

# Lambda SG: no inbound, outbound allowed (Lambda called via API GW)
resource "aws_security_group" "lambda" {
  name        = local.name.lambda_sg
  description = "Lambda SG (no inbound), outbound allowed"
  vpc_id      = aws_vpc.this.id

  # Outbound to anywhere (NAT handles internet egress)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.base_tags, {
    Name = local.name.lambda_sg
  })
}

# Endpoint SG: allow HTTPS from Lambda SG -> VPC endpoints
resource "aws_security_group" "endpoints" {
  name        = local.name.endpoint_sg
  description = "VPC endpoint SG allowing 443 from lambda SG"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.base_tags, {
    Name = local.name.endpoint_sg
  })
}

##############################################
# 8) VPC Endpoints (reduce NAT cost + secure) #
##############################################

# Interface endpoint: CloudWatch Logs
resource "aws_vpc_endpoint" "logs" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${var.region}.logs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true

  tags = merge(local.base_tags, {
    Name = "${var.project}-vpce-logs${var.name_suffix}"
  })
}

# Interface endpoint: Secrets Manager
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true

  tags = merge(local.base_tags, {
    Name = "${var.project}-vpce-secrets${var.name_suffix}"
  })
}

# Interface endpoint: KMS
resource "aws_vpc_endpoint" "kms" {
  vpc_id              = aws_vpc.this.id
  service_name        = "com.amazonaws.${var.region}.kms"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  security_group_ids  = [aws_security_group.endpoints.id]
  private_dns_enabled = true

  tags = merge(local.base_tags, {
    Name = "${var.project}-vpce-kms${var.name_suffix}"
  })
}

# Gateway endpoint: S3 (attach to private route tables)
resource "aws_vpc_endpoint" "s3" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private_a.id, aws_route_table.private_b.id]

  tags = merge(local.base_tags, {
    Name = "${var.project}-vpce-s3${var.name_suffix}"
  })
}

# Gateway endpoint: DynamoDB (attach to private route tables)
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id            = aws_vpc.this.id
  service_name      = "com.amazonaws.${var.region}.dynamodb"
  vpc_endpoint_type = "Gateway"
  route_table_ids   = [aws_route_table.private_a.id, aws_route_table.private_b.id]

  tags = merge(local.base_tags, {
    Name = "${var.project}-vpce-dynamodb${var.name_suffix}"
  })
}