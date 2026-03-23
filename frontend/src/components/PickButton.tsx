import React from "react";

interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function PickButton({ onClick, disabled }: Props): JSX.Element {
  return (
    <button type="button" onClick={onClick} disabled={disabled}>
      Pick a Restaurant
    </button>
  );
}
