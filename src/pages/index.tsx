import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
	Activity, 
	Target, 
	TrendingUp, 
	Trophy, 
	ArrowRight, 
	CheckCircle, 
	Zap,
	Brain,
	BarChart3,
	Shield,
	Heart,
	BookOpen,
	Users,
	Lock,
	Smartphone,
	Calendar
} from 'lucide-react';
// Note: public landing page (no auth guard)

const HomePage: React.FC = () => {
	const router = useRouter();

	return (
		<div className="min-h-screen bg-black text-white">
			{/* Navigation Header */}
			<nav className="relative z-10 bg-black/95 backdrop-blur-sm border-b border-gray-800">
				<div className="max-w-5xl mx-auto px-6">
					<div className="flex items-center justify-between h-16">
						<div className="flex items-center">
							<Brain className="text-red-600 mr-2" size={28} />
							<h1 className="text-2xl font-bold text-white">
								Mind
								<span className="text-red-600">Ascent</span>
							</h1>
						</div>
            
						<div className="flex items-center gap-4">
											<button
																	onClick={() => router.push('/login')}
								className="text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
							>
								Log In
							</button>
											<button
												onClick={() => router.push('/signup-new')}
								className="bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-500/30 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
							>
								Create Account
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-red-900/30 via-black to-black" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
				{/* Subtle background glow accents */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[46rem] h-[46rem] bg-red-600/10 blur-3xl rounded-full" />
					<div className="absolute bottom-[-14rem] right-[-10rem] w-[36rem] h-[36rem] bg-red-700/10 blur-3xl rounded-full" />
				</div>
	<div className="relative max-w-5xl mx-auto px-6 py-10 lg:py-12">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center"
					>
						<h1 className="text-6xl lg:text-8xl font-black mb-4 leading-tight">
							<span className="text-white">Mind</span>
							<span className="bg-gradient-to-r from-red-300 via-red-500 to-red-700 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(239,68,68,0.3)]">Ascent</span>
							<span className="block text-xl lg:text-2xl font-medium text-neutral-300 mt-2">
								Your <span className="text-red-500 font-semibold">Mental Health</span> Tool for <span className="text-red-500 font-semibold">Athletes</span>
							</span>
						</h1>
            
						<p className="text-lg lg:text-xl text-gray-300 mb-4 max-w-3xl mx-auto leading-relaxed">
							MindAscent helps athletes of all levels improve their mental well-being through daily check-ins, guided exercises, and progress tracking.
						</p>
            
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
											<motion.button
												whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)" }}
												whileTap={{ scale: 0.95 }}
												onClick={() => router.push('/signup-new')}
								className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-500/30 text-white px-12 py-4 rounded-xl text-lg font-bold flex items-center gap-3 transition-all shadow-2xl border border-red-500/20"
							>
								Create Account
								<ArrowRight size={20} />
							</motion.button>
              
											<motion.button
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
																	onClick={() => router.push('/login')}
								className="border-2 border-gray-500 hover:border-red-500 hover:bg-red-600/10 focus:ring-4 focus:ring-gray-500/30 text-white px-12 py-4 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm"
							>
								Log In
							</motion.button>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
	<section className="pt-8 pb-16 bg-gray-900/40">
				<div className="max-w-5xl mx-auto px-6">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-3xl lg:text-4xl font-black mb-4">Tools to Support Your <span className="text-red-500">Mental Health</span></h2>
						<p className="text-lg text-gray-400 max-w-2xl mx-auto">
							Six powerful tools designed for athletes of all levels
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.1 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<Activity className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Check-Ins</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									Quick daily check-ins to monitor your mental well-being.
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<Target className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Exercises</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									Guided breathing, visualization, and positive self-talk routines.
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.3 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<BarChart3 className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Progress & Insights</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									See trends over time to understand your mental performance.
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<BookOpen className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Education Hub</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									Sports psychology content & mental health education
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.5 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<Heart className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Crisis Resources</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									Professional support & hotlines when you need them most
								</p>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.6 }}
							viewport={{ once: true }}
							className="group"
						>
							<div className="bg-gray-800/60 border border-gray-700 hover:border-red-500/50 p-6 rounded-2xl text-center transition-all duration-300 group-hover:bg-gray-800/80 h-full backdrop-blur-sm hover:shadow-xl hover:shadow-red-500/10">
								<div className="bg-red-600/20 group-hover:bg-red-600/30 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
									<Trophy className="text-red-400" size={28} />
								</div>
								<h3 className="text-lg font-bold mb-3">Streaks & Motivation</h3>
								<p className="text-gray-400 text-sm leading-relaxed">
									Stay consistent with badges and progress milestones.
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Why Choose MindAscent Section */}
			<section className="py-16 bg-gray-900/60">
				<div className="max-w-5xl mx-auto px-6">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="bg-gradient-to-r from-red-600/20 to-red-800/20 border border-red-600/30 rounded-3xl p-8 backdrop-blur-sm shadow-2xl"
					>
						<div className="text-center mb-10">
							<h3 className="text-2xl lg:text-3xl font-black mb-4 text-white">Why Athletes Choose MindAscent</h3>
							<p className="text-lg text-gray-300 max-w-2xl mx-auto">
								Built by athletes, for athletes at every level focusing on mental health and performance
							</p>
						</div>
            
						<div className="grid md:grid-cols-3 gap-6">
							<div className="text-center">
								<div className="bg-red-600/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Lock className="text-red-300" size={32} />
								</div>
								<h4 className="text-lg font-bold mb-3 text-white">100% Private</h4>
								<p className="text-gray-400 text-sm">
									Your data stays yours. No sharing, no judgment, just progress.
								</p>
							</div>
              
							<div className="text-center">
								<div className="bg-red-600/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Users className="text-red-300" size={32} />
								</div>
								<h4 className="text-lg font-bold mb-3 text-white">Athlete-Built</h4>
								<p className="text-gray-400 text-sm">
									Designed for athletes of all levels with unique mental challenges.
								</p>
							</div>
              
							<div className="text-center">
								<div className="bg-red-600/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<Smartphone className="text-red-300" size={32} />
								</div>
								<h4 className="text-lg font-bold mb-3 text-white">Always Ready</h4>
								<p className="text-gray-400 text-sm">
									Quick check-ins & exercises available 24/7 on any device.
								</p>
							</div>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-16 bg-black">
				<div className="max-w-5xl mx-auto px-6">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<h2 className="text-3xl lg:text-4xl font-black mb-6 leading-tight">
								Transform Your Mental Game
							</h2>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<CheckCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
									<div>
										<h3 className="text-lg font-bold mb-2">Science-Backed</h3>
										<p className="text-gray-400 text-sm leading-relaxed">
											Every technique is research-proven effective in competition
										</p>
									</div>
								</div>
                
								<div className="flex items-start gap-4">
									<CheckCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
									<div>
										<h3 className="text-lg font-bold mb-2">Sport-Specific</h3>
										<p className="text-gray-400 text-sm leading-relaxed">
											Personalized for your sport, level, and individual goals
										</p>
									</div>
								</div>
                
								<div className="flex items-start gap-4">
									<CheckCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
									<div>
										<h3 className="text-lg font-bold mb-2">Measurable Results</h3>
										<p className="text-gray-400 text-sm leading-relaxed">
											Track improvements with detailed analytics & progress viz
										</p>
									</div>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: 30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border border-gray-700 p-8 rounded-2xl text-center backdrop-blur-sm shadow-2xl">
								<Shield className="text-red-500 mx-auto mb-4" size={40} />
								<h3 className="text-2xl font-black mb-4">Ready to Focus on Your Mental Game?</h3>
								<p className="text-lg text-gray-400 mb-6 leading-relaxed">
									Join athletes of all levels improving their mental well-being.
								</p>
												<motion.button
													whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220, 38, 38, 0.3)" }}
													whileTap={{ scale: 0.95 }}
													onClick={() => router.push('/signup-new')}
									className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-4 focus:ring-red-500/30 text-white px-10 py-4 rounded-xl text-lg font-bold w-full transition-all shadow-2xl"
								>
									Create Account
								</motion.button>
								<p className="text-xs text-gray-500 mt-3">
									Setup in under 2 minutes
								</p>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900/60 border-t border-gray-800">
				<div className="max-w-5xl mx-auto px-6 py-12">
					<div className="grid md:grid-cols-3 gap-8">
						<div>
							<div className="flex items-center mb-3">
								<Brain className="text-red-600 mr-2" size={20} />
								<h3 className="text-lg font-bold text-white">Mind<span className="text-red-600">Ascent</span></h3>
							</div>
							<p className="text-gray-400 text-sm leading-relaxed">
								Mental health and performance platform for athletes of all levels.
							</p>
						</div>
            
						<div>
							<h4 className="font-bold mb-4 text-white">Platform</h4>
							<ul className="space-y-2 text-gray-400 text-sm">
								<li>
														<button 
															onClick={() => router.push('/signup-new')}
										className="hover:text-white transition-colors"
									>
										Create Account
									</button>
								</li>
								<li>
														<button 
																	onClick={() => router.push('/login')}
										className="hover:text-white transition-colors"
									>
										Sign In
									</button>
								</li>
							</ul>
						</div>
            
						<div>
							<h4 className="font-bold mb-4 text-white">Contact</h4>
							<div className="space-y-1 text-gray-400 text-sm">
								<div className="text-gray-500">Email</div>
								<a href="mailto:mindascentinfo@gmail.com" className="hover:text-white transition-colors">mindascentinfo@gmail.com</a>
							</div>
						</div>
					</div>
          
					<div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-500 text-sm">
						<p>&copy; 2026 MindAscent. All rights reserved.</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default HomePage;