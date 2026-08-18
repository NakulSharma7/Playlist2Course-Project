import { Play, Clock, CheckCircle2, Circle, Layers } from 'lucide-react'

const MOCK_COURSE = {
  title: 'Complete Web Development',
  progress: 42,
  totalVideos: 48,
  completedVideos: 20,
  estimatedTime: '36 hours',
  modules: [
    { name: 'HTML & CSS Fundamentals', videos: 8, completed: true },
    { name: 'JavaScript Essentials', videos: 12, completed: true },
    { name: 'React Framework', videos: 10, completed: false, active: true },
    { name: 'Node.js & Express', videos: 10, completed: false },
    { name: 'MongoDB & Deployment', videos: 8, completed: false },
  ],
}

function CoursePreview() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          Generated Dashboard Preview
        </span>
      </div>

      {/* Course Card Preview Mockup */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Course Dashboard
              </span>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">
                {MOCK_COURSE.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300">
              <span className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Play size={14} className="text-indigo-400" />
                {MOCK_COURSE.totalVideos} videos
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock size={14} className="text-indigo-400" />
                {MOCK_COURSE.estimatedTime}
              </span>
            </div>
          </div>

          {/* Progress bar section */}
          <div className="mt-6">
            <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
              <span className="text-slate-300 font-medium">Overall Progress</span>
              <span className="text-indigo-400 font-bold">{MOCK_COURSE.progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${MOCK_COURSE.progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {MOCK_COURSE.completedVideos} of {MOCK_COURSE.totalVideos} videos completed
            </p>
          </div>
        </div>

        {/* Modules Section */}
        <div className="p-6 sm:p-8 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={16} className="text-indigo-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Structured Modules
            </h4>
          </div>

          <div className="space-y-2.5">
            {MOCK_COURSE.modules.map((module, idx) => (
              <div
                key={module.name}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  module.active
                    ? 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                    : module.completed
                    ? 'bg-white border-slate-200/80 text-slate-500'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {module.completed ? (
                    <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                  ) : module.active ? (
                    <Play size={20} className="text-indigo-600 fill-indigo-600 shrink-0" />
                  ) : (
                    <Circle size={20} className="text-slate-300 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-400 mr-2">
                      0{idx + 1}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        module.active
                          ? 'text-indigo-900'
                          : module.completed
                          ? 'text-slate-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {module.name}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  {module.videos} videos
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default CoursePreview
