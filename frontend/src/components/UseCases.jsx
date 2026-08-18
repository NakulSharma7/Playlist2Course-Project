export default function UseCases() {
  const cases = [
    { num: '01', title: 'DSA playlists', tag: 'Algorithms / patterns' },
    { num: '02', title: 'Web development', tag: 'Frontend / backend' },
    { num: '03', title: 'Data science', tag: 'Python / analytics' },
    { num: '04', title: 'Machine learning', tag: 'Models / practice' },
    { num: '05', title: 'System design', tag: 'Architecture / scale' },
    { num: '06', title: 'Interview preparation', tag: 'Practice / review' },
  ];

  return (
    <section className="section" data-od-id="use-cases-section">
      <div className="shell usecase-wrap">
        <div className="usecase-copy">
          <p className="eyebrow">03 / Made for momentum</p>
          <h2 className="display" data-od-id="use-cases-heading">
            Built for <em>self-learners</em><span className="dot">.</span>
          </h2>
          <p>Have a 100-video DSA playlist? Turn it into a focused learning path with a next clear step.</p>
        </div>
        <div className="case-list">
          {cases.map((c) => (
            <div className="case" key={c.num}>
              <span>{c.num}</span>
              <strong>{c.title}</strong>
              <i>{c.tag}</i>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
