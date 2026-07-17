import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle,
  Globe,
  ArrowRight
} from 'lucide-react';
import { Navbar } from '../../components/ui/Navbar';
import { Footer } from '../../components/ui/Footer';
import { Card } from '../../components/ui/Card';
import { apiClient } from '../../lib/api-client';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    console.log('Contact form submitted:', data);
    const toastId = toast.loading('Sending message...');
    
    try {
      await apiClient.contact.submit(data);
      toast.success('Message sent successfully! We will get back to you soon.', { id: toastId });
      setIsSent(true);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message. Please try again.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactDetails = [
    {
      icon: Mail,
      title: 'Email Support',
      desc: 'Get in touch with our dedicated support team.',
      value: 'sutarswapnil322@gmail.com',
      href: 'mailto:sutarswapnil322@gmail.com',
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/15',
      hoverGlow: 'hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 hover:border-emerald-500/30',
      glowColor: 'bg-emerald-500/20'
    },
    {
      icon: Globe,
      title: 'Personal Portfolio',
      desc: 'Check out the developer\'s portfolio and other projects.',
      value: 'er-swapppy.vercel.app',
      href: 'https://er-swapppy.vercel.app/',
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/15',
      hoverGlow: 'hover:bg-blue-500/5 dark:hover:bg-blue-500/10 hover:border-blue-500/30',
      glowColor: 'bg-blue-500/20'
    },
    {
      icon: MapPin,
      title: 'Office Location',
      desc: 'Our developer base and remote headquarters.',
      value: 'Pune, maharashtra, India',
      href: '#',
      color: 'text-purple-500 bg-purple-500/10 border-purple-500/15',
      hoverGlow: 'hover:bg-purple-500/5 dark:hover:bg-purple-500/10 hover:border-purple-500/30',
      glowColor: 'bg-purple-500/20'
    },
    {
      icon: Clock,
      title: 'Operating Hours',
      desc: 'When we are active online to resolve queries.',
      value: 'Mon - Fri, 9:00 AM - 6:00 PM IST',
      href: '#',
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/15',
      hoverGlow: 'hover:bg-amber-500/5 dark:hover:bg-amber-500/10 hover:border-amber-500/30',
      glowColor: 'bg-amber-500/20'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring' as const, 
        stiffness: 100, 
        damping: 15 
      } 
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg flex flex-col justify-between select-none relative overflow-hidden">
      <Navbar />

      {/* Decorative dot-mesh background */}
      <div className="absolute inset-0 bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] dark:bg-[radial-gradient(#27314A_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Decorative circular glow highlights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 pt-32 pb-20 relative z-10 w-full flex-grow flex flex-col justify-center">
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <div className="px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-500/15 dark:border-emerald-500/30 shadow-sm inline-flex select-none animate-pulse">
            Get In Touch
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
            How can we <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">help you</span> today?
          </h1>
          <p className="text-sm md:text-base text-slate-450 dark:text-slate-500 font-semibold leading-relaxed">
            Have questions about features, feedback on workflow systems, or inquiries about customized integrations? Send us a message and we'll resolve it promptly.
          </p>
        </div>

        {/* Content Section Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch"
        >
          {/* Left Column: Contact Cards Grid */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
              {contactDetails.map((item, idx) => (
                <motion.div key={idx} variants={itemVariants} className="group">
                  <Card 
                    className={`p-5 md:p-6 bg-white/90 dark:bg-card-bg/90 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${item.hoverGlow}`}
                  >
                    {/* Soft glowing mesh overlay inside card on hover */}
                    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${item.glowColor}`} />
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`p-3 rounded-xl border ${item.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <item.icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xs font-black text-gray-850 dark:text-slate-100 uppercase tracking-widest">{item.title}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-900 relative z-10">
                      {item.href !== '#' ? (
                        <a 
                          href={item.href} 
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-xs font-extrabold text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>{item.value}</span>
                          <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-gray-750 dark:text-gray-300 select-all">{item.value}</span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <motion.div variants={itemVariants} className="h-full">
              <Card className="p-6 md:p-8 bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900/90 dark:via-slate-950/85 dark:to-slate-900/90 backdrop-blur-md border border-gray-100/80 dark:border-gray-800/80 shadow-xl rounded-3xl h-full flex flex-col justify-center relative overflow-hidden group">
                {/* Decorative glowing ambient rings inside the card */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-teal-500/5 dark:bg-teal-500/10 blur-3xl rounded-full pointer-events-none group-hover:scale-110 transition-transform duration-700" />

                <AnimatePresence mode="wait">
                  {!isSent ? (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleSubmit(onSubmit)} 
                      className="space-y-5 relative z-10"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Name */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-550 dark:text-gray-450 uppercase tracking-widest block select-none">Full Name</label>
                          <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full px-4 py-2.5 rounded-xl border bg-gray-50/40 dark:bg-gray-950/40 text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border-gray-200 dark:border-gray-800/80 focus:border-emerald-500 transition-all text-gray-800 dark:text-white font-semibold"
                            {...register('name', { required: 'Name is required' })}
                          />
                          {errors.name && (
                            <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.name.message}</span>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-550 dark:text-gray-450 uppercase tracking-widest block select-none">Email Address</label>
                          <input
                            type="email"
                            placeholder="name@example.com"
                            className="w-full px-4 py-2.5 rounded-xl border bg-gray-50/40 dark:bg-gray-950/40 text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border-gray-200 dark:border-gray-800/80 focus:border-emerald-500 transition-all text-gray-800 dark:text-white font-semibold"
                            {...register('email', { 
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                          />
                          {errors.email && (
                            <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.email.message}</span>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-550 dark:text-gray-450 uppercase tracking-widest block select-none">Subject</label>
                        <input
                          type="text"
                          placeholder="Inquiry Subject"
                          className="w-full px-4 py-2.5 rounded-xl border bg-gray-50/40 dark:bg-gray-950/40 text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border-gray-200 dark:border-gray-800/80 focus:border-emerald-500 transition-all text-gray-800 dark:text-white font-semibold"
                          {...register('subject', { required: 'Subject is required' })}
                        />
                        {errors.subject && (
                          <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.subject.message}</span>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-550 dark:text-gray-450 uppercase tracking-widest block select-none">Message</label>
                        <textarea
                          rows={5}
                          placeholder="Type your message details here..."
                          className="w-full px-4 py-3 rounded-xl border bg-gray-50/40 dark:bg-gray-950/40 text-sm focus:bg-white dark:focus:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 border-gray-200 dark:border-gray-800/80 focus:border-emerald-500 transition-all text-gray-800 dark:text-white resize-none font-semibold"
                          {...register('message', { 
                            required: 'Message content is required',
                            minLength: { value: 10, message: 'Message must be at least 10 characters' }
                          })}
                        />
                        {errors.message && (
                          <span className="text-[10px] font-bold text-red-500 mt-1 block">{errors.message.message}</span>
                        )}
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-lg shadow-emerald-500/15 hover:shadow-xl hover:shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Sending Message...</span>
                          </>
                        ) : (
                          <>
                            <Send size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                            <span>Submit Message</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="text-center py-10 space-y-6 relative z-10"
                    >
                      <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 mb-2">
                        <CheckCircle size={48} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Message Received!</h2>
                        <p className="text-xs md:text-sm font-semibold text-gray-505 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                          Thank you for reaching out. A ticket has been logged and our support engineers will respond to your email within 24 business hours.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsSent(false)}
                        className="px-6 py-2.5 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-gray-800 font-bold text-xs tracking-wider rounded-2xl cursor-pointer transition-all shadow-sm"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
