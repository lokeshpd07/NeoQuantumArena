export interface Lesson {
  id: number;
  title: string;
  level: string;
  xp: number;
  duration: string;
  description: string;
  progress?: number;
  content: {
    intro: string;
    concepts: { term: string; definition: string }[];
    quiz: { question: string; options: string[]; correct: number; explanation: string }[];
  };
}

export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Qubits & States",
    level: "Foundation",
    xp: 240,
    duration: "8 min",
    description: "Understand what a qubit is and how it differs from a classical bit.",
    content: {
      intro:
        "A qubit is the fundamental unit of quantum information. Unlike a classical bit (0 or 1), a qubit can exist in a **superposition** of both 0 and 1 simultaneously until measured.",
      concepts: [
        { term: "|0⟩", definition: "The ground state of a qubit — analogous to classical 0." },
        { term: "|1⟩", definition: "The excited state of a qubit — analogous to classical 1." },
        { term: "Bloch Sphere", definition: "A unit sphere used to visualize qubit states geometrically. The north pole is |0⟩, the south pole is |1⟩." },
        { term: "Ket notation", definition: "Dirac bra-ket notation |ψ⟩ used to represent quantum states." },
      ],
      quiz: [
        { question: "What distinguishes a qubit from a classical bit?", options: ["It stores more bits", "It can exist in superposition", "It is faster", "It uses less power"], correct: 1, explanation: "A qubit can be in a superposition of |0⟩ and |1⟩ simultaneously, unlike a classical bit that is always exactly 0 or 1." },
        { question: "What does measurement do to a superposition state?", options: ["Amplifies it", "Collapses it to 0 or 1", "Leaves it unchanged", "Doubles it"], correct: 1, explanation: "Measurement collapses the superposition, giving a definite classical outcome (0 or 1) with probabilities determined by the amplitudes." },
      ],
    },
  },
  {
    id: 2,
    title: "Superposition",
    level: "Foundation",
    xp: 320,
    duration: "10 min",
    description: "Learn how the Hadamard gate creates and destroys superposition.",
    content: {
      intro:
        "Superposition lets a qubit encode both 0 and 1 with different probability amplitudes. The **Hadamard (H) gate** transforms |0⟩ into the equal superposition (|0⟩ + |1⟩)/√2, giving a 50% chance of measuring either outcome.",
      concepts: [
        { term: "Amplitude", definition: "A complex number α such that |α|² gives the probability of measuring that state." },
        { term: "Hadamard Gate", definition: "H = (1/√2)[[1,1],[1,-1]]. Puts a qubit into equal superposition." },
        { term: "Probability", definition: "P(outcome) = |amplitude|². All probabilities must sum to 1." },
        { term: "Interference", definition: "Amplitudes can cancel (destructive) or reinforce (constructive) — key to quantum algorithms." },
      ],
      quiz: [
        { question: "What is the state after H is applied to |0⟩?", options: ["|0⟩", "|1⟩", "(|0⟩+|1⟩)/√2", "(|0⟩-|1⟩)/√2"], correct: 2, explanation: "H|0⟩ = (|0⟩+|1⟩)/√2 — a balanced superposition with equal 50% probabilities for each outcome." },
        { question: "What happens if you apply H twice?", options: ["Stays in superposition", "Returns to |0⟩", "Collapses to |1⟩", "Creates entanglement"], correct: 1, explanation: "H is its own inverse: H·H = I. Applying it twice returns the qubit to its original state." },
      ],
    },
  },
  {
    id: 3,
    title: "Quantum Gates",
    level: "Core",
    xp: 480,
    duration: "14 min",
    description: "Master the single-qubit gate toolkit: X, Y, Z, S, T, and H.",
    content: {
      intro:
        "Quantum gates are unitary matrices that transform qubit states. Every gate must be **reversible** (unlike classical logic) because quantum operations are time-reversible. Key gates include X (NOT flip), Z (phase flip), and the Hadamard.",
      concepts: [
        { term: "X Gate (NOT)", definition: "Flips |0⟩↔|1⟩. The quantum equivalent of a classical NOT gate." },
        { term: "Z Gate", definition: "Leaves |0⟩ unchanged but flips the sign of |1⟩ → -|1⟩. A phase flip." },
        { term: "Y Gate", definition: "Combines X and Z: Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩." },
        { term: "Unitary Matrix", definition: "A matrix U where U†U = I. Guarantees reversibility and probability conservation." },
      ],
      quiz: [
        { question: "Which gate is the quantum equivalent of a classical NOT?", options: ["H", "Z", "X", "CX"], correct: 2, explanation: "The X gate (Pauli-X) flips |0⟩ to |1⟩ and vice versa, exactly like a classical NOT." },
        { question: "Why must quantum gates be unitary?", options: ["To be fast", "To preserve total probability", "To use less memory", "To create entanglement"], correct: 1, explanation: "Unitarity ensures ∑|αᵢ|² = 1 is preserved, keeping probabilities valid." },
      ],
    },
  },
  {
    id: 4,
    title: "Entanglement",
    level: "Core",
    xp: 620,
    duration: "18 min",
    description: "Discover how the CX gate creates inseparable two-qubit states.",
    content: {
      intro:
        "Two qubits are **entangled** when their states cannot be written as a product of individual states. The canonical example is the Bell state (|00⟩ + |11⟩)/√2, created with H + CNOT.",
      concepts: [
        { term: "CNOT / CX Gate", definition: "Flips the target qubit if and only if the control qubit is |1⟩. The most common two-qubit gate." },
        { term: "Bell State", definition: "(|00⟩+|11⟩)/√2 — maximum entanglement between two qubits. Measuring one instantly determines the other." },
        { term: "Separable State", definition: "A multi-qubit state that can be written as a tensor product |ψ⟩⊗|φ⟩." },
        { term: "Non-locality", definition: "Entangled particles show correlated measurements regardless of distance — not faster-than-light communication." },
      ],
      quiz: [
        { question: "What is a Bell state?", options: ["A measurement result", "A maximally entangled two-qubit state", "A single-qubit superposition", "A type of noise"], correct: 1, explanation: "(|00⟩+|11⟩)/√2 is the simplest Bell state, showing perfect correlation between two qubits." },
        { question: "How do you create a Bell state with gates?", options: ["X then CX", "H on q0 then CX(q0,q1)", "Z then H", "CX alone"], correct: 1, explanation: "Apply H to q0 to create superposition, then CNOT(q0,q1) to entangle them." },
      ],
    },
  },
  {
    id: 5,
    title: "Teleportation",
    level: "Algorithm",
    xp: 900,
    duration: "25 min",
    description: "Understand how quantum teleportation transfers state using entanglement.",
    content: {
      intro:
        "Quantum teleportation transfers an unknown qubit state between two parties using a shared entangled pair and two classical bits. It does **not** transmit matter or information faster than light.",
      concepts: [
        { term: "Alice & Bob", definition: "The two parties in the protocol. Alice has the state to send; Bob receives it." },
        { term: "Classical Channel", definition: "The 2-bit classical message Alice sends Bob after her measurement." },
        { term: "Correction Operations", definition: "Bob applies X and/or Z based on Alice's classical bits to recover the original state." },
        { term: "No-Cloning Theorem", definition: "It is impossible to create an identical copy of an unknown quantum state." },
      ],
      quiz: [
        { question: "How many classical bits does Alice send Bob in teleportation?", options: ["0", "1", "2", "4"], correct: 2, explanation: "Alice measures two qubits and sends 2 classical bits specifying which corrections Bob must apply." },
        { question: "Is Alice's original qubit destroyed during teleportation?", options: ["No, she keeps a copy", "Yes, measurement collapses it", "It depends on the gate", "Only if Bob fails"], correct: 1, explanation: "Measurement collapses Alice's qubit, consistent with the no-cloning theorem." },
      ],
    },
  },
];

export interface Challenge {
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  acceptance: string;
  xp: number;
  category: string;
  description: string;
  hint: string;
  targetOps: string[]; // gates required
}

export const challenges: Challenge[] = [
  {
    title: "Forge a Bell State",
    difficulty: "Easy",
    acceptance: "78%",
    xp: 300,
    category: "Circuit",
    description: "Create the Bell state (|00⟩+|11⟩)/√2 using exactly 2 gates: H on q0 and CX targeting q1.",
    hint: "Start with H on qubit 0, then add a CX gate. The probabilities for |00⟩ and |11⟩ should each be ~50%.",
    targetOps: ["H", "CX"],
  },
  {
    title: "Repair the Entangler",
    difficulty: "Medium",
    acceptance: "51%",
    xp: 550,
    category: "Debug",
    description: "A broken entangler circuit is missing a gate. Add the correct gate to restore maximum entanglement.",
    hint: "The circuit has a CX but is missing the superposition gate first. Add H to q0.",
    targetOps: ["H", "CX"],
  },
  {
    title: "Beat the Oracle",
    difficulty: "Hard",
    acceptance: "24%",
    xp: 900,
    category: "Code",
    description: "Build a Deutsch-Jozsa oracle that identifies a balanced function in one query using superposition.",
    hint: "Apply H to all qubits, then the oracle (X on target), then H again. Measure — all zeros means constant.",
    targetOps: ["H", "X", "H"],
  },
  {
    title: "Teleport with 5 Gates",
    difficulty: "Hard",
    acceptance: "18%",
    xp: 1100,
    category: "Optimize",
    description: "Implement the quantum teleportation protocol using at most 5 gates. State must transfer with ≥98% fidelity.",
    hint: "H, CX (entangle), CX (Bell measurement), H, then apply corrections.",
    targetOps: ["H", "CX", "CX", "H"],
  },
  {
    title: "Measure the Unknown",
    difficulty: "Easy",
    acceptance: "84%",
    xp: 260,
    category: "Quiz",
    description: "A qubit is in state (3|0⟩ + 4|1⟩)/5. What is the probability of measuring |1⟩?",
    hint: "P(|1⟩) = |amplitude of |1⟩|² = (4/5)² = 16/25 = 64%",
    targetOps: [],
  },
];

export const ranks = [
  ["AK", "Aarav K.", "Quantum Legend", "12,840"],
  ["MS", "Mira S.", "Entangler", "11,920"],
  ["ZR", "Zoya R.", "Entangler", "11,410"],
  ["NV", "Neel V.", "Circuit Master", "10,980"],
  ["IA", "Ishaan A.", "Circuit Master", "10,620"],
  ["LP", "Lokesh P.", "Quantum Coder", "8,450"],
  ["RM", "Rhea M.", "Quantum Coder", "8,120"],
  ["PK", "Priya K.", "Quantum Coder", "7,890"],
  ["SJ", "Siddharth J.", "Gate Builder", "7,200"],
  ["TP", "Tanya P.", "Gate Builder", "6,950"],
];