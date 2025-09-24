import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Sparkles,
  Bot,
  ShieldCheck,
  Zap,
  FileText,
  DollarSign,
  ChevronRight,
  ArrowRight,
  Brain,
  Upload,
  Database,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mounted, setMounted] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      icon: <Bot className="h-8 w-8" />,
      title: "AI-Powered Analysis",
      description:
        "Extract invoice data instantly using advanced AI vision technology",
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "IPFS Storage",
      description:
        "Secure, decentralized storage for your documents and extracted data",
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: "Blockchain Security",
      description:
        "Immutable records on Solana blockchain for ultimate data integrity",
    },
  ];

  return (
    <div className="min-h-screen w-full relative bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
      <div className="absolute top-20 left-20 w-72 h-72 bg-[#e78a53]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#e78a53]/5 rounded-full blur-3xl" />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(231, 138, 83, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(231, 138, 83, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#e78a53] to-[#f4a261] flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">CyFuture AI</span>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-zinc-400 hover:text-[#e78a53] transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-zinc-400 hover:text-[#e78a53] transition-colors"
            >
              How it Works
            </a>
            <a
              href="#security"
              className="text-zinc-400 hover:text-[#e78a53] transition-colors"
            >
              Security
            </a>
          </nav>

          <Button
            onClick={onGetStarted}
            className="bg-[#e78a53] hover:bg-[#d17845] text-white border-0"
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge
              variant="secondary"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-zinc-800/50 text-zinc-300 border-zinc-700"
            >
              <Sparkles className="h-4 w-4 text-[#e78a53]" />
              AI-Powered Invoice Processing
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Transform <span className="text-[#e78a53]">Invoices</span>
              <br />
              Into <span className="text-[#e78a53]">Insights</span>
            </h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Upload your invoices, let AI extract the data, store it securely
              on IPFS, and record immutable proof on the Solana blockchain. The
              future of document processing is here.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[#e78a53] hover:bg-[#d17845] text-white text-lg px-8 py-6 h-auto"
            >
              Start Processing
              <Upload className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 text-lg px-8 py-6 h-auto"
            >
              View Demo
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Feature Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    className={`text-center p-6 rounded-xl transition-all duration-300 ${
                      currentFeature === index
                        ? "bg-[#e78a53]/10 border border-[#e78a53]/30"
                        : "bg-zinc-800/30 border border-zinc-700/50"
                    }`}
                    animate={{
                      scale: currentFeature === index ? 1.05 : 1,
                      y: currentFeature === index ? -5 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                        currentFeature === index
                          ? "bg-[#e78a53]/20 text-[#e78a53]"
                          : "bg-zinc-700 text-zinc-400"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Experience the complete invoice processing pipeline with
              cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="h-6 w-6" />,
                title: "AI Vision Processing",
                description:
                  "Advanced computer vision extracts data from any invoice format with 99% accuracy",
              },
              {
                icon: <Database className="h-6 w-6" />,
                title: "IPFS Integration",
                description:
                  "Decentralized storage ensures your documents are always accessible and tamper-proof",
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Blockchain Proof",
                description:
                  "Solana blockchain creates immutable records of all processed documents",
              },
              {
                icon: <Zap className="h-6 w-6" />,
                title: "Lightning Fast",
                description:
                  "Process invoices in seconds with our optimized AI and blockchain infrastructure",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Multi-format Support",
                description:
                  "Works with PDFs, images, and scanned documents in any language",
              },
              {
                icon: <DollarSign className="h-6 w-6" />,
                title: "Cost Effective",
                description:
                  "Pay only for what you use with transparent, blockchain-based pricing",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-xl p-6 hover:border-[#e78a53]/50 transition-all duration-300 group"
              >
                <div className="bg-[#e78a53]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#e78a53]/20 transition-colors">
                  <div className="text-[#e78a53]">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400 text-lg">
              Simple, secure, and lightning-fast processing
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Upload",
                description: "Drop your invoice image or PDF",
                icon: <Upload className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "AI Processing",
                description: "AI extracts all relevant data",
                icon: <Bot className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "IPFS Storage",
                description: "Files stored on decentralized network",
                icon: <Database className="h-8 w-8" />,
              },
              {
                step: "04",
                title: "Blockchain Proof",
                description: "Immutable record on Solana",
                icon: <ShieldCheck className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-[#e78a53] to-transparent" />
                )}
                <div className="bg-[#e78a53]/10 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e78a53]/30">
                  <div className="text-[#e78a53]">{step.icon}</div>
                </div>
                <div className="text-2xl font-bold text-[#e78a53] mb-2">
                  {step.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-zinc-400 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-[#e78a53]/10 to-[#f4a261]/10 border border-[#e78a53]/30 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Invoice Processing?
            </h2>
            <p className="text-zinc-400 text-lg mb-8">
              Join the future of document management with AI, IPFS, and
              blockchain technology
            </p>
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-[#e78a53] hover:bg-[#d17845] text-white text-lg px-12 py-6 h-auto"
            >
              Get Started Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#e78a53] to-[#f4a261] flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">CyFuture AI</span>
          </div>
          <p className="text-zinc-400">
            Powered by AI, secured by blockchain, stored on IPFS
          </p>
        </div>
      </footer>
    </div>
  );
}
