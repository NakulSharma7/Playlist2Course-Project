export default function Features() {
  const featureList = [
    { symbol: '↘', title: 'Structured learning', text: 'Turn long playlists into organized modules.', id: 'feature-card-structured' },
    { symbol: '◌', title: 'Progress tracking', text: 'See what you’ve completed and what’s left.', id: 'feature-card-progress' },
    { symbol: '⌘', title: 'Smart organization', text: 'Group related videos into logical sections.', id: 'feature-card-organization' },
    { symbol: '▦', title: 'Learning dashboard', text: 'Keep every generated course in one place.', id: 'feature-card-dashboard' },
    { symbol: '✦', title: 'AI-powered structure', text: 'Future-ready learning paths that make content meaningful.', id: 'feature-card-ai' },
    { symbol: '→', title: 'Resume where you left off', text: 'Return to the last completed video, without searching.', id: 'feature-card-resume' },
  ];

  return (
    <section className="section" id="features" data-od-id="features-section">
      <div className="shell">
        <div className="section-header">
          <p className="eyebrow">02 / Your workspace</p>
          <div>
            <h2 className="display" data-od-id="features-heading">
              Everything you need to learn <em>better</em><span className="dot">.</span>
            </h2>
          </div>
        </div>
        <div className="features">
          {featureList.map((item) => (
            <article className="feature" key={item.id} data-od-id={item.id}>
              <span className="feature-symbol">{item.symbol}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
