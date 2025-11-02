function HeroSection({ onExplore }) {
  return (
    <section className="hero">
      <p className="hero__eyebrow">Prototype Research Interface</p>
      <h1 className="hero__title">Explore purchasing power through tangible baskets</h1>
      <p className="hero__copy">
        Measure in Goods experiments with framing markets in terms of real-world
        goods. Toggle between routes to read, explore research notes, and test a
        charting demo that prices assets against reference indexes.
      </p>
      <div className="hero__actions">
        <button type="button" className="hero__cta" onClick={onExplore}>
          Explore the demo
        </button>
        <span className="hero__hint">or browse the sections below</span>
      </div>
    </section>
  );
}

export default HeroSection;
