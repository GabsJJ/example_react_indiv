import { useState } from 'react'
import './App.css'
import { motion } from "framer-motion";

interface NodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  children: string[];
}

const nodesData: Record<string, NodeData> = {
  app: { id: "app", label: "App", x: 300, y: 100, children: ["counter1", "counter2", "footer"] },
  counter1: { id: "counter1", label: "Counter1", x: 150, y: 250, children: ["display1"] },
  counter2: { id: "counter2", label: "Counter2", x: 450, y: 250, children: ["display2", "logger"] },
  display1: { id: "display1", label: "Display1", x: 150, y: 400, children: [] },
  display2: { id: "display2", label: "Display2", x: 450, y: 400, children: [] },
  footer: { id: "footer", label: "Footer", x: 300, y: 400, children: [] },
  logger: { id: "logger", label: "Logger", x: 600, y: 400, children: [] }
};

interface NodeProps {
  x: number;
  y: number;
  label: string;
  state?: string | number | null;
  onClick: () => void;
  pulse: boolean;
}

function Node({ x, y, label, state, onClick, pulse }: NodeProps) {
  return (
    <>
      <motion.circle
        cx={x}
        cy={y}
        r={30}
        fill="#88ccff"
        stroke="#0055aa"
        strokeWidth={2}
        onClick={onClick}
        animate={pulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{ cursor: "pointer" }}
      />
      <text x={x} y={y} textAnchor="middle" dy="5" fontSize="12">
        {label}
      </text>
      {state !== null && state !== undefined && (
        <text x={x} y={y + 20} textAnchor="middle" fontSize="10" fill="#333">
          {typeof state === "number" ? `count: ${state}` : state}
        </text>
      )}
    </>
  );
}

interface ConnectionProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  pulse: boolean;
}

function Connection({ x1, y1, x2, y2, pulse }: ConnectionProps) {
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#88aaff"
      strokeWidth={2}
      animate={
        pulse
          ? {
              strokeWidth: [2, 6, 2],
              stroke: ["#88aaff", "#0055ff", "#88aaff"]
            }
          : {}
      }
      transition={{ duration: 0.6 }}
    />
  );
}

type StatesMap = Record<string, number | null>;

type PulsesMap = Record<string, boolean>;

function App() {
 const [states, setStates] = useState<StatesMap>({
    app: null,
    counter1: 0,
    counter2: 0,
    display1: 0,
    display2: 0,
    footer: null,
    logger: 0
  });

  const [pulses, setPulses] = useState<PulsesMap>({});

  // Função para propagar side-effects na árvore
  function propagateUpdate(nodeId: string, newStates: StatesMap, newPulses: PulsesMap) {
    const node = nodesData[nodeId];
    if (!node) return;

    newPulses[nodeId] = true;

    const prevState = newStates[nodeId];
    newStates[nodeId] = typeof prevState === "number" ? prevState + 1 : prevState;

    node.children.forEach((childId) => propagateUpdate(childId, newStates, newPulses));
  }

  function handleClick(nodeId: string) {
    const newStates = { ...states };
    const newPulses: PulsesMap = {};

    propagateUpdate(nodeId, newStates, newPulses);

    setStates(newStates);
    setPulses(newPulses);

    setTimeout(() => setPulses({}), 600);
  }

  return (
    <svg width="800" height="600" style={{ background: "#f0f4ff" }}>
      {/* Conexões */}
      {Object.values(nodesData).map(({ id, x, y, children }) =>
        children.map((childId) => {
          const child = nodesData[childId];
          return (
            <Connection
              key={`${id}-${childId}`}
              x1={x}
              y1={y}
              x2={child.x}
              y2={child.y}
              pulse={!!(pulses[id] && pulses[childId])}
            />
          );
        })
      )}

      {/* Nodes */}
      {Object.values(nodesData).map(({ id, x, y, label }) => (
        <Node
          key={id}
          x={x}
          y={y}
          label={label}
          state={states[id]}
          onClick={() => handleClick(id)}
          pulse={!!pulses[id]}
        />
      ))}
    </svg>
  );
}

export default App
