import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const skills = [
  {
    category: 'Frontend',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Redux', 'GraphQL'],
  },
  {
    category: 'Backend',
    technologies: ['Node.js', 'Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker'],
  },
  {
    category: 'Cloud & DevOps',
    technologies: ['AWS', 'CI/CD', 'Kubernetes', 'Terraform', 'GitHub Actions'],
  },
];

export default function About() {
  return (
    <Layout>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About Me</h2>
              <div className="mt-6 text-lg leading-8 text-gray-600 space-y-6">
                <p>
                  Hello! I'm Dan Traynor, a passionate Software Engineer with extensive experience in
                  full-stack development. I specialize in building scalable web applications and
                  creating elegant solutions to complex problems.
                </p>
                <p>
                  With over a decade of experience in the tech industry, I've had the opportunity to
                  work on diverse projects ranging from high-performance web applications to
                  distributed systems. My approach combines technical expertise with a strong focus
                  on user experience and business value.
                </p>
                <p>
                  When I'm not coding, you can find me contributing to open-source projects,
                  writing technical articles, or exploring new technologies. I'm particularly
                  interested in cloud architecture, AI/ML, and modern web development practices.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:pl-8 lg:pt-4"
            >
              <div className="mx-auto max-w-xl lg:mx-0">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">Technical Skills</h3>
                <div className="mt-6 space-y-8">
                  {skills.map((skillGroup, idx) => (
                    <motion.div
                      key={skillGroup.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
                    >
                      <h4 className="text-lg font-semibold text-gray-900">{skillGroup.category}</h4>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {skillGroup.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Experience Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-20 max-w-2xl lg:mx-0 lg:max-w-none"
          >
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Experience</h3>
            <div className="space-y-8">
              <div className="relative">
                <div className="ml-6">
                  <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full border-2 border-indigo-600 bg-white" />
                  <div className="border-l-2 border-gray-200 pl-6 pt-2">
                    <div className="font-semibold text-gray-900">Senior Software Engineer</div>
                    <div className="text-sm text-gray-500">2020 - Present</div>
                    <div className="mt-2 text-gray-600">
                      Led development of scalable web applications using modern technologies.
                      Implemented CI/CD pipelines and improved system architecture.
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="ml-6">
                  <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full border-2 border-indigo-600 bg-white" />
                  <div className="border-l-2 border-gray-200 pl-6 pt-2">
                    <div className="font-semibold text-gray-900">Software Developer</div>
                    <div className="text-sm text-gray-500">2017 - 2020</div>
                    <div className="mt-2 text-gray-600">
                      Developed and maintained full-stack applications. Collaborated with cross-functional
                      teams to deliver high-quality software solutions.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
