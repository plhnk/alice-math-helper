import "./App.css";
import { useEffect, useState, useRef } from "react";
import Levels from "./components/levels";

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function App() {
  const [hasRan, setHasRan] = useState(false);
  const [maxNumber, setMaxNumber] = useState(9);
  const [useAddition, setUseAddition] = useState(false);

  const [goal, setGoal] = useState(30);

  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [flashGreen, setFlashGreen] = useState(false);
  const [numCorrect, setNumCorrect] = useState(0);
  const [numWrong, setNumWrong] = useState(0);

  const currentNumCorrect = useRef(numCorrect);
  currentNumCorrect.current = numCorrect;

  const [meterValue, setMeterValue] = useState(0);

  const currentMeterValue = useRef(meterValue);

  currentMeterValue.current = meterValue;

  const getNext = () => {
    return getRandomInt(maxNumber) + 1;
  };

  const getAddition = () => {
    const firstNumber = getNext();
    const secondNumber = getNext();

    const set = new Set();
    set.add(firstNumber + secondNumber);
    while (set.size < 4) {
      set.add(getNext() + secondNumber);
    }

    const answers = Array.from(set);
    answers.sort((a, b) => a - b);
    return { number1: firstNumber, number2: secondNumber, answers };
  };

  const getMultiplication = () => {
    const numerator = getNext();
    const denominator = getNext();

    const set = new Set();
    set.add(numerator * denominator);
    while (set.size < 4) {
      set.add(getNext() * denominator);
    }

    const answers = Array.from(set);
    answers.sort((a, b) => a - b);
    return { number1: numerator, number2: denominator, answers };
  };

  const getSet = (addition) => {
    if (addition) {
      return getAddition();
    }
    return getMultiplication();
  };

  const [{ number1, number2, answers }, setCurrentProblem] = useState(() =>
    getSet()
  );

  const [timeRemaining, setTimeRemaining] = useState(0);

  const currentTimeRemaining = useRef(timeRemaining);

  currentTimeRemaining.current = timeRemaining;

  const countdownTimer = useRef();
  useEffect(() => {
    if (timeRemaining <= 0) {
    } else {
      countdownTimer.current = setTimeout(() => {
        currentTimeRemaining.current = timeRemaining - 1;
        setTimeRemaining(timeRemaining - 1);
        //setMeterValue(Math.max(0, currentMeterValue.current - 1.5));
      }, 1000);
    }
  }, [timeRemaining]);

  const meterTimer = useRef();

  if (timeRemaining <= 0 && meterTimer.current) {
    clearInterval(meterTimer.current);
    meterTimer.current = null;
  }

  const countdown = timeRemaining - 60;

  useEffect(() => {
    if (timeRemaining > 0 && !meterTimer.current && countdown <= 0) {
      meterTimer.current = setInterval(() => {
        if (currentTimeRemaining.current > 0) {
          const delta = Math.max(
            0.001,
            (goal + 1 - currentNumCorrect.current) /
              currentTimeRemaining.current /
              2
          );

          currentMeterValue.current -= delta;
          setMeterValue(Math.max(0, currentMeterValue.current));
        }
      }, 50);
    }
  }, [timeRemaining, goal]);

  const onStart = () => {};

  const onSelectAddition = () => {
    currentMeterValue.current = 10;
    setMeterValue(10);
    setUseAddition(true);
    onStart();
    if (timeRemaining) {
      clearTimeout(countdownTimer.current);
    }
    setCurrentProblem(getSet(true));
    setNumWrong(0);

    currentNumCorrect.current = 0;
    setNumCorrect(0);

    setTimeRemaining(63);
    setHasRan(true);
  };

  const onSelectMultiplication = () => {
    currentMeterValue.current = 10;
    setMeterValue(10);
    setUseAddition(false);
    onStart();
    if (timeRemaining) {
      clearTimeout(countdownTimer.current);
    }
    setCurrentProblem(getSet(false));
    setNumWrong(0);

    currentNumCorrect.current = numCorrect;
    setNumCorrect(0);

    setTimeRemaining(63);
    setHasRan(true);
  };

  const isWaiting = useRef(false);

  const flashTimeout = useRef(null);

  const onSelectAnswer = (answer) => {
    if (timeRemaining && !isWaiting.current) {
      const actualAnswer = useAddition ? number1 + number2 : number1 * number2;
      if (answer === actualAnswer) {
        currentNumCorrect.current = numCorrect + 1;
        setNumCorrect(numCorrect + 1);

        currentMeterValue.current = 10;
        setMeterValue(10);
        setCurrentProblem(getSet(useAddition));
        setFlashGreen(true);
        clearTimeout(flashTimeout.current);
        flashTimeout.current = setTimeout(() => {
          setFlashGreen(false);
        }, 1000);
      } else {
        isWaiting.current = true;
        setNumWrong(numWrong + 1);
        setWrongAnswer(answer);
        setTimeout(() => {
          setWrongAnswer(null);
          setCurrentProblem(getSet(useAddition));
          isWaiting.current = false;
        }, 2000);
      }
    }
  };
  const [goalInput, setGoalInput] = useState(goal);
  return (
    <div>
      {!timeRemaining && (
        <div className="intro">
          <div className="levels">
            <div className="levelsdesc">Select difficulty</div>
            <Levels setMaxNumber={setMaxNumber} />
            <div>
              <label>Goal: </label>
              <input
                type="number"
                value={goalInput}
                onChange={(e) => {
                  setGoalInput(e.target.value);
                  const newGoal = parseInt(e.target.value);
                  if (newGoal > 5 && newGoal < 100) {
                    setGoal(newGoal);
                  }
                }}
              />
            </div>
          </div>

          <div>
            <div>
              {hasRan && !timeRemaining ? `You got ${numCorrect} right!` : ""}
            </div>
            <div>
              {" "}
              {hasRan && !timeRemaining ? `You got ${numWrong} wrong.` : ""}
            </div>
          </div>
          <button style={{ fontSize: 20 }} onClick={onSelectAddition}>
            Addition test
          </button>
          <button style={{ fontSize: 20 }} onClick={onSelectMultiplication}>
            Multiplication test
          </button>
        </div>
      )}
      {countdown > 0 && <div className="countdown">{countdown}</div>}
      {countdown <= 0 && timeRemaining > 0 && (
        <div className={`App${countdown > 0 ? " app-opaque" : ""}`}>
          <div
            style={{
              flex: "1",
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div>
              <div>Time left: {timeRemaining}s</div>
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "60px",
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {!useAddition && (
                <span>
                  {number1} X {number2}
                </span>
              )}
              {useAddition && (
                <span>
                  {number1} + {number2}
                </span>
              )}
            </div>
          </div>
          <div className="Answer">
            {answers.map((answer, index) => {
              const makeGreen =
                wrongAnswer !== null &&
                answer ===
                  (useAddition ? number1 + number2 : number1 * number2);

              const makeRed = wrongAnswer === answer;
              return (
                <div
                  className="AnswerDiv"
                  style={{
                    gridColumnStart: index % 2 ? 2 : 1,
                    gridRowStart: index >= 2 ? 2 : 1,
                  }}
                >
                  <button
                    style={{
                      background: makeGreen
                        ? "lightgreen"
                        : makeRed
                        ? "red"
                        : "lightgrey",
                    }}
                    onClick={() => onSelectAnswer(answer)}
                  >
                    {answer}
                  </button>
                </div>
              );
            })}
            <div
              style={{
                gridColumnStart: 3,
                gridRowStart: 1,
                gridRowEnd: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <meter
                max={10}
                min={0}
                value={meterValue}
                style={{
                  transform: "rotate(270deg)",
                  height: "60px",
                  width: "170px",
                  position: "absolute",
                  "--transition-speed": meterValue >= 8 ? "0" : "0.5s",
                  "--meter-color":
                    meterValue >= 8
                      ? "green"
                      : meterValue > 5
                      ? "yellow"
                      : "red",
                  "--red-rgb":
                    meterValue >= 8
                      ? 0
                      : meterValue < 5
                      ? 255
                      : (255 * (meterValue - 5)) / 3,
                  "--green-rgb":
                    meterValue >= 5
                      ? 255
                      : meterValue <= 2
                      ? 0
                      : 255 - (255 * (meterValue - 2)) / 3,
                }}
              ></meter>
            </div>
          </div>
          <div
            style={{
              flex: "1",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
              fontSize: "60px",
            }}
          >
            <div style={{ fontSize: 32 }}>
              Goal progress:{" "}
              <meter value={numCorrect} min={0} max={goal}></meter>
            </div>
            <div style={{ fontSize: 32 }}>Wrong: {numWrong}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
