export default function Faq() {
  const faqs = [
    {
      id: 'faq-supported-playlists',
      question: 'What playlists will CourseForge support?',
      answer: 'CourseForge is being designed for educational video playlists. Support for specific platforms and playlist formats will be announced as the product develops.',
    },
    {
      id: 'faq-create-account',
      question: 'Do I need an account to create a course?',
      answer: 'Not for this early preview. Accounts will arrive with saved courses, learning history, and progress tracking.',
    },
    {
      id: 'faq-organization',
      question: 'How will a playlist be organized?',
      answer: 'CourseForge will group related lessons into a practical sequence, giving long playlists clearer modules and a focused next step.',
    },
    {
      id: 'faq-availability',
      question: 'Can I use CourseForge today?',
      answer: 'The playlist workflow is still in development. You can explore the product direction here while course creation is being prepared.',
    },
  ];

  return (
    <section className="section" id="faqs" data-od-id="faqs-section">
      <div className="shell faq-grid">
        <div className="faq-intro">
          <p className="eyebrow">04 / Good to know</p>
          <h2 className="display" data-od-id="faqs-heading">
            A few clear <em>answers</em><span className="dot">.</span>
          </h2>
        </div>
        <div className="faq-list" data-od-id="faq-list">
          {faqs.map((faq) => (
            <details className="faq-item" key={faq.id} data-od-id={faq.id}>
              <summary>{faq.question}</summary>
              <p className="faq-answer">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
