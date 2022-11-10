import clsx, { ClassValue } from "clsx";
import {
  ComponentProps,
  createElement,
  ElementType,
  ForwardedRef,
  forwardRef,
  FunctionComponent,
} from "react";

type StylableProps = {
  className?: string;
};

/**
 * Represents a function which computes a style for given props.
 */
type PropsClassValue<Props> = (props: Props) => ClassValue;

/**
 * Create a styled version of a component, for consistency.
 * @param component A React component, or a string like 'div' or 'input'
 * @param classes Arguments to pass to `clsx` or a function to produce classes from the props
 */
export function styled<T extends ElementType<StylableProps>>(
  component: T,
  ...classes: (ClassValue | PropsClassValue<ComponentProps<T>>)[]
): FunctionComponent<ComponentProps<T>> {
  const styled = forwardRef(
    (props: ComponentProps<T>, ref: ForwardedRef<T>) => {
      const { className, ...restProps } = props;

      return createElement(component, {
        className: clsx(
          ...classes.map((x) => (typeof x === "function" ? x(props) : x)),
          className
        ),
        ...restProps,
        ref,
      });
    }
  );

  if (typeof component === "string") {
    styled.displayName = `Styled_${component}`;
  } else if (component.displayName) {
    styled.displayName = `Styled${component.displayName}`;
  } else {
    styled.displayName = "StyledComponent";
  }

  // the ref will be the same type but typescript can't infer this
  return styled as any;
}
