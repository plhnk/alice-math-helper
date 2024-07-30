import React from "react";

const Levels = ({ maxNumber, setMaxNumber, start = 4, end = 20 }) => {
    // default start and end are 4 and 20, but this can be set in the component using start and end props
  const levels = Array.from({ length: end - start + 1 }, (_, i) => i + start);

  return (
    <>
      {levels.map((level) => (
        <button
          key={level}
          className={maxNumber === level ? "selected" : ""}
          onClick={() => setMaxNumber(level)}
        >
          {level}
        </button>
      ))}
    </>
  );
};

export default Levels;