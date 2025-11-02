import { forwardRef } from "react";

const ContentSection = forwardRef(function ContentSection(
  { id, title, description, children },
  ref
) {
  return (
    <section id={id} ref={ref} className="content-section">
      <div className="content-section__header">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      <div className="content-section__body">{children}</div>
    </section>
  );
});

export default ContentSection;
