import "./index.less";
import { ComponentPropsWithoutRef } from "react";
import classNames from "classnames";

const Button = (props: ComponentPropsWithoutRef<"button">) => {
  const cls = classNames("my-button", props.className);

  return <button {...props} className={cls} />;
};

export default Button;
