import { forwardRef } from "react";
import Button from "./Button.jsx";

const Pill = forwardRef(({ active = false, className = "", children, ...props }, ref) => {
  const classes = ["ui-pill"];
  if (className) {
    classes.push(className);
  }

  return (
    <Button
      {...props}
      ref={ref}
      variant="pill"
      active={active}
      className={classes.join(" ")}
    >
      <span className="ui-pill__label">{children}</span>
    </Button>
  );
});

Pill.displayName = "Pill";

export default Pill;
