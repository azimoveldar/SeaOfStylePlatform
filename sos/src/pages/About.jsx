import React from 'react';
import { Users, Heart, Sparkles } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero Section */}
      <section className="relative bg-[#F5EFE0] py-28 overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#E8A84C]/15 translate-x-1/2 -translate-y-1/3 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-5">Who We Are</p>
          <h1 className="text-6xl md:text-7xl font-black text-[#111111] mb-6" style={{fontFamily:'Playfair Display, serif'}}>
            Our Story
          </h1>
          <p className="text-lg text-[#4A4A4A] max-w-xl font-light leading-relaxed">
            Where three minds flow together to create something beautiful
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 36C360 12 720 0 1080 12C1260 18 1380 36 1440 36V36H0Z" fill="#FAF7F2"/>
          </svg>
        </div>
      </section>

      {/* The Meaning of "Sea" */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="bg-white rounded-3xl p-12 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[#F5EFE0] rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#C96B3A]" />
              </div>
              <h2 className="text-3xl font-bold text-black" style={{fontFamily:'Playfair Display, serif'}}>The Meaning Behind "Sea"</h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Sea of Style isn't just a name—it's a philosophy. The "Sea" in our brand represents the flowing collaboration between three passionate individuals: <span className="font-bold">Shirish, Eldar, and Amir</span>.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Like the vast ocean where countless currents converge to create something greater than themselves, our team brings together diverse perspectives, skills, and creative visions. Each wave of inspiration contributes to the whole, creating a dynamic and ever-evolving fashion experience.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              It's not about literal oceans—it's about the <span className="font-bold text-[#C96B3A]">depth of collaboration</span>, the <span className="font-bold text-[#C96B3A]">flow of creativity</span>, and the <span className="font-bold text-[#C96B3A]">endless possibilities</span> when talented minds work in harmony.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#F5EFE0]">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">The Founders</p>
            <h2 className="text-5xl font-black text-[#111111]" style={{fontFamily:'Playfair Display, serif'}}>Meet the Team</h2>
            <p className="text-[#4A4A4A] mt-3 font-light">The minds behind Sea of Style</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Shirish', role: 'Creative Vision', bg: 'bg-[#EDD9A3]' },
              { name: 'Eldar', role: 'Strategic Design', bg: 'bg-[#E8C4A8]' },
              { name: 'Amir', role: 'Technical Innovation', bg: 'bg-[#D4C4B0]' }
            ].map((member) => (
              <div key={member.name} className="text-center">
                <div className={`w-32 h-32 ${member.bg} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                  <span className="text-4xl font-black text-[#111111]/30">{member.name[0]}</span>
                </div>
                <h3 className="text-2xl font-bold text-black mb-1" style={{fontFamily:'Playfair Display, serif'}}>{member.name}</h3>
                <p className="text-[#C96B3A] text-xs font-semibold tracking-widest uppercase">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-3">What We Stand For</p>
            <h2 className="text-5xl font-black text-[#111111]" style={{fontFamily:'Playfair Display, serif'}}>Our Values</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Heart, title: 'Passion for Fashion', description: 'Every piece is carefully selected with love and attention to detail.' },
              { icon: Users, title: 'Collaborative Spirit', description: 'We believe great things happen when diverse minds work together.' },
              { icon: Sparkles, title: 'Quality First', description: 'Premium materials and craftsmanship in every product we offer.' }
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-[#F5EFE0] rounded-full flex items-center justify-center mb-4">
                  <value.icon className="w-7 h-7 text-[#C96B3A]" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-28 bg-[#111111] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white" />
        </div>
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#E8A84C] mb-6">Our Mission</p>
          <h2 className="text-5xl font-black mb-8" style={{fontFamily:'Playfair Display, serif'}}>Our Mission</h2>
          <p className="text-[#A0A0A0] leading-relaxed font-light max-w-2xl mx-auto text-lg">
            To create a fashion experience that flows naturally between quality, style, and accessibility. 
            We're not just selling clothes—we're curating a lifestyle that celebrates individuality, 
            collaboration, and the beautiful intersection where fashion meets purpose.
          </p>
        </div>
      </section>
    </div>
  );
}