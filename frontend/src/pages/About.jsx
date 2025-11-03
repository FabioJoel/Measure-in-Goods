export default function AboutPage() {
  return (
    <section className="site-wrap narrative" id="about">
      <div className="narrative__card">
        <h2>Why goods?</h2>
        <p>
          Nominal charts hide the real trade-offs people face. Repricing
          indexes in concrete units helps investors, policy makers, and
          households anchor their decisions in lived experience.
        </p>
        <p>
          Our prototype blends public datasets with hand-built baskets so
          the ratios stay legible. Upcoming releases will widen coverage and
          add streaming updates.
        </p>
      </div>
      <div className="narrative__card">
        <h2>What&apos;s next</h2>
        <p>
          We&apos;re wiring historical data for housing, energy, and staple
          food indices. Custom baskets will hydrate from the same feed so
          you can compare favourite assets against hyper-specific mixes.
        </p>
        <p>
          Have ideas for another basket? Drop a note and we&apos;ll explore
          how to surface it in the interface.
        </p>
      </div>
    </section>
  );
}
