import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-[#F5EFE0] py-28 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-[#E8A84C]/15 translate-x-1/2 -translate-y-1/3 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C96B3A] mb-5">Reach Out</p>
          <h1 className="text-6xl md:text-7xl font-black text-[#111111] mb-6" style={{fontFamily:'Playfair Display, serif'}}>
            Get in Touch
          </h1>
          <p className="text-lg text-[#4A4A4A] font-light">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 36C360 12 720 0 1080 12C1260 18 1380 36 1440 36V36H0Z" fill="#FAF7F2"/>
          </svg>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 md:p-12">
              <h2 className="text-3xl font-black text-[#111111] mb-8" style={{fontFamily:'Playfair Display, serif'}}>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-2">Your Name</label>
                  <input
                    type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-[#111111]/12 bg-[#FDFAF6] focus:border-[#C96B3A] focus:outline-none transition-colors text-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-2">Email Address</label>
                  <input
                    type="email" id="email" name="email" value={formData.email} onChange={handleChange} required
                    className="w-full px-4 py-3 rounded-xl border border-[#111111]/12 bg-[#FDFAF6] focus:border-[#C96B3A] focus:outline-none transition-colors text-sm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-xs font-semibold tracking-widest uppercase text-[#111111] mb-2">Message</label>
                  <textarea
                    id="message" name="message" value={formData.message} onChange={handleChange} required rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-[#111111]/12 bg-[#FDFAF6] focus:border-[#C96B3A] focus:outline-none transition-colors resize-none text-sm"
                    placeholder="Tell us how we can help..."
                  />
                </div>
                <button
                  type="submit" disabled={submitted}
                  className={`w-full py-4 rounded-full font-semibold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 ${
                    submitted ? 'bg-[#4A7C59] text-white' : 'bg-[#111111] text-white hover:bg-[#C96B3A]'
                  }`}
                >
                  {submitted ? 'Message Sent!' : <><Send className="w-4 h-4" /> Send Message</>}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-10 py-4">
              <div>
                <h2 className="text-3xl font-black text-[#111111] mb-4" style={{fontFamily:'Playfair Display, serif'}}>Contact Information</h2>
                <p className="text-[#4A4A4A] leading-relaxed font-light">
                  Have questions about our products, shipping, or returns? We're here to help!
                </p>
              </div>
              <div className="space-y-7">
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 bg-[#F5EFE0] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#C96B3A]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-1">Email Us</h3>
                    <p className="text-[#4A4A4A] text-sm">support@seaofstyle.com</p>
                    <p className="text-xs text-[#888888] mt-0.5">We'll respond within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 bg-[#F5EFE0] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#C96B3A]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-1">Call Us</h3>
                    <p className="text-[#4A4A4A] text-sm">+1 (555) 123-4567</p>
                    <p className="text-xs text-[#888888] mt-0.5">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-11 h-11 bg-[#F5EFE0] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#C96B3A]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-1">Visit Us</h3>
                    <p className="text-[#4A4A4A] text-sm">123 Fashion Street<br />Style District, NY 10001</p>
                  </div>
                </div>
              </div>
              <div className="bg-[#F5EFE0] rounded-2xl p-7">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[#111111] mb-2">Quick Response Guaranteed</h3>
                <p className="text-[#4A4A4A] text-sm font-light leading-relaxed">
                  Our team typically responds to all inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}