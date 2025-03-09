import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';

const projects = [
  {
    title: 'Project Management Dashboard',
    description: 'A modern project management tool built with React and TypeScript. Features include real-time updates, task tracking, and team collaboration.',
    tech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    image: '/images/project1.jpg',
  },
  {
    title: 'E-commerce Platform',
    description: 'Full-stack e-commerce solution with advanced features like real-time inventory management and analytics dashboard.',
    tech: ['Next.js', 'Python', 'FastAPI', 'Redis'],
    image: '/images/project2.jpg',
  },
  {
    title: 'AI-Powered Analytics Tool',
    description: 'Machine learning application that provides predictive analytics for business metrics and customer behavior.',
    tech: ['Python', 'TensorFlow', 'React', 'AWS'],
    image: '/images/project3.jpg',
  },
];

export default function Projects() {
  return (
    <Layout>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Projects</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              A collection of my recent work and technical projects.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {projects.map((project, idx) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * idx }}
                className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
              >
                <div className="absolute inset-0">
                  <div className="h-full w-full bg-gradient-to-t from-gray-900 via-gray-900/40" />
                </div>
                <div className="absolute inset-0 -z-10 h-full w-full bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="absolute inset-0 -z-10 h-full w-full bg-gray-100" />

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-md bg-indigo-400/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-400/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <h3 className="z-10 mt-3 text-2xl font-bold text-white">{project.title}</h3>
                <p className="z-10 mt-2 text-sm text-gray-300">{project.description}</p>
                <div className="z-10 mt-4">
                  <button className="text-sm font-medium text-white hover:text-indigo-300">
                    Learn more <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
