import { forwardRef } from "react";

const Button = forwardRef(
  (
    {
      type = "button",
      variant = "ghost",
      active = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const classes = ["ui-button", `ui-button--${variant}`];
    if (active) {
      classes.push("is-active");
    }
    if (className) {
      classes.push(className);
    }

    return (
      <button
        {...props}
        ref={ref}
        type={type}
        className={classes.join(" ")}
        data-state={active ? "active" : "inactive"}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
