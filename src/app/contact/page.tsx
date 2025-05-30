"use client"
import React, { useState } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Heart,
  ExternalLink,
  Users,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/contact/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Thank you for your message! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        alert(data.error || 'Failed to send message. Please try again later.');
      }
    } catch {
      alert('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Heart className="h-5 w-5" />
              </div>
              <span className="ml-2 text-xl font-bold text-emerald-800">The Advocate</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors">Home</Link>
              <Link href="/#about" className="text-gray-700 hover:text-emerald-600 transition-colors">About</Link>
              <Link href="/campaigns" className="text-gray-700 hover:text-emerald-600 transition-colors">Campaigns</Link>
              <Link href="/contact" className="text-emerald-600 font-medium">Contact</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
            We&apos;re here to help and answer any questions you might have. 
            We look forward to hearing from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Reach out to us through any of the following channels. Our support team is ready to assist you.
                </p>
              </div>

              {/* Phone Support */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Phone className="h-5 w-5 text-emerald-600 mr-2" />
                  Phone Support
                </h3>
                <p className="text-gray-600 mb-4">👉 Call/Chat with us now:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <a 
                      href="tel:07011193014" 
                      className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                    >
                      📱 07011193014
                    </a>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <a 
                      href="tel:09066103108" 
                      className="text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
                    >
                      📱 09066103108
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media & Communities */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 text-emerald-600 mr-2" />
                  Join Our Community
                </h3>
                <p className="text-gray-600 mb-4">Connect with us on social media and join our community:</p>
                <div className="space-y-3">
                  <a 
                    href="https://t.me/ur_advoc8" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 font-medium">Telegram Channel</span>
                    <ExternalLink className="h-4 w-4 text-blue-500 group-hover:text-blue-600" />
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/ESQKalVZKRx1lHlaHUzTfs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                  >
                    <MessageCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-medium">WhatsApp Community</span>
                    <ExternalLink className="h-4 w-4 text-green-500 group-hover:text-green-600" />
                  </a>
                </div>
              </div>

              {/* Additional Contact Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <a href="mailto:youradvocateislamicfundraiser@gmail.com" className="text-emerald-600 hover:text-emerald-700">
                        youradvocateislamicfundraiser@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Location</h4>
                      <p className="text-gray-600">Ibadan, Oyo State, Nigeria</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-emerald-600 mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Support Hours</h4>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="What is this regarding?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Please describe your inquiry in detail..."
                  />
                </div>
                
                <button
                  onClick={handleSubmit}
                  className="w-full bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Quick answers to common questions</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How quickly do you respond to inquiries?</h3>
              <p className="text-gray-600">We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call our support numbers directly.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What are your support hours?</h3>
              <p className="text-gray-600">Our phone support is available Monday-Friday 9AM-6PM, and Saturday 10AM-4PM. Our online communities are active 24/7.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I get help with campaign applications?</h3>
              <p className="text-gray-600">Absolutely! Our team can help you with campaign applications, documentation, and any questions about the process.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Heart className="h-5 w-5" />
              </div>
              <span className="ml-2 text-xl font-bold">The Advocate</span>
            </div>
            <p className="text-gray-400 mb-4">Advocating for those in need, building stronger communities together.</p>
            <div className="flex justify-center space-x-6">
              <a href="https://t.me/ur_advoc8" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                Telegram
              </a>
              <a href="https://chat.whatsapp.com/ESQKalVZKRx1lHlaHUzTfs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                WhatsApp
              </a>
              <a href="mailto:youradvocateislamicfundraiser@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                Email
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400">&copy; 2025 The Advocate. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContactPage;