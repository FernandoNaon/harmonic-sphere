/* eslint-disable react-hooks/exhaustive-deps */

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { NoteData, seventh, modality, tool } from "../types/Index";
import * as Tone from "tone";
import { radius, angleIncrement, notes } from "../utils/utils";

interface HarmoniaContext {
  test: string;
  scale: NoteData;
  setScale: React.Dispatch<React.SetStateAction<NoteData>>;
  modality: modality;
  setModality: React.Dispatch<React.SetStateAction<modality>>;
  seventh: seventh;
  setSeventh: React.Dispatch<React.SetStateAction<seventh>>;
  chordNotes: NoteData[];
  setChordNotes: React.Dispatch<React.SetStateAction<NoteData[]>>;
  audio: boolean;
  setAudio: React.Dispatch<React.SetStateAction<boolean>>;
  players: Tone.Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Tone.Player[]>>;
  selectedTool: tool;
  setSelectedTool: React.Dispatch<React.SetStateAction<tool>>;
  selectedGreekMode: tool;
  setSelectedGreekMode: React.Dispatch<React.SetStateAction<tool>>;

  getNoteFilePath: (noteValue: number, baseNote: number) => string;
  handleChangeNote: (value: number, notes: NoteData[]) => void;
  playChordSequentially: () => void;
  handleChangeScale: (selectedValue: string) => void;
  handleChangeSeventh: (selectedValue: string) => void;
  handleAudioToggle: () => void;
  calculatePosition: (index: number) => { x: number; y: number };
  drawChordLines: () => ReactNode;
  generateChord: (noteIndex: number) => NoteData[];
  generateMode: (noteIndex: number, mode: string) => NoteData[];
  preloadAudio: () => void;
  handleChangeTool: (selectedValue: string) => void;
  handleChangeGreekMode: (selectedValue: string) => void;
}

const HarmoniaContext = createContext<HarmoniaContext | undefined>(undefined);

interface HarmoniaProviderProps {
  children: ReactNode;
}

export const HarmoniaProvider: React.FC<HarmoniaProviderProps> = ({
  children,
}) => {
  const test = "Context works!!!";
  const [scale, setScale] = useState<NoteData>({ value: 1, label: "C" });
  const [modality, setModality] = useState<modality>({ modality: "Major" });
  const [seventh, setSeventh] = useState<seventh>({ hasSeventh: false });
  const [selectedTool, setSelectedTool] = useState<tool>({ value: "chordGen" });
  const [selectedGreekMode, setSelectedGreekMode] = useState<tool>({
    value: "Ionian",
  });

  const [chordNotes, setChordNotes] = useState<NoteData[]>([]);
  const [audio, setAudio] = useState<boolean>(false);
  const [players, setPlayers] = useState<Tone.Player[]>([]);

  const getNoteFilePath = (noteValue: number, baseNote: number): string => {
    const octaveOffset = noteValue < baseNote ? 12 : 0;
    return `/notes/${noteValue + octaveOffset}.wav`;
  };

  const handleChangeNote = (value: number, notes: NoteData[]) => {
    const selectedNote = notes.find((note) => note.value === value);
    if (selectedNote) {
      setScale(selectedNote);
    }
    if (audio) {
      playChordSequentially();
    }
  };

  const playChordSequentially = () => {
    players.forEach((player, index) => {
      player.start(Tone.now() + index * 0.5);
    });
  };

  const handleChangeScale = (selectedValue: string) => {
    setModality({ modality: selectedValue });
  };

  const handleChangeGreekMode = (selectedValue: string) => {
    setSelectedGreekMode({ value: selectedValue });
  };

  const handleChangeSeventh = (selectedValue: string) => {
    let hasSeventh = false;
    let isMajor: boolean | undefined;

    if (selectedValue === "Major" || selectedValue === "Minor") {
      hasSeventh = true;
      isMajor = selectedValue === "Major";
    }
    setSeventh({ hasSeventh, isMajor });
  };

  const handleAudioToggle = () => {
    setAudio(!audio);
  };

  const handleChangeTool = (selectedValue: string) => {
    setSelectedTool({ value: selectedValue });
  };

  const calculatePosition = (index: number) => {
    const startAngle = -Math.PI / 2;
    const angle = startAngle + index * angleIncrement;
    const x = Math.round(radius * Math.cos(angle) + radius);
    const y = Math.round(radius * Math.sin(angle) + radius);
    return { x, y };
  };

  const drawChordLines = () => {
    if (!scale) return null;
    const points = chordNotes.map(({ value }) => {
      const { x, y } = calculatePosition(value - 1);
      return `${x},${y}`;
    });
    const d = `M${points.join("L")}Z`;

    const pathStyle: React.CSSProperties = {
      fill: "none",
      stroke: "var(--secondary-color)",
      strokeWidth: "4",
    };
    console.log(<path d={d} style={pathStyle} />)
    return <path d={d} style={pathStyle} />;
  };
  
  const generateChord = (noteIndex: number): NoteData[] => {
    let chordIntervals: number[];
    switch (modality.modality) {
      case "Major":
        chordIntervals = [0, 4, 7];
        if (seventh.hasSeventh) {
          chordIntervals.push(seventh.isMajor ? 11 : 10);
        }
        break;
      case "Minor":
        chordIntervals = [0, 3, 7];
        if (seventh.hasSeventh) {
          chordIntervals.push(seventh.isMajor ? 11 : 10);
        }
        break;
      case "Dim":
        chordIntervals = [0, 3, 6];
        if (seventh.hasSeventh) {
          chordIntervals.push(10);
        }
        break;
      case "Aug":
        chordIntervals = [0, 4, 8];
        if (seventh.hasSeventh) {
          chordIntervals.push(11);
        }
        break;
      default:
        throw new Error("Invalid modality");
    }

    return chordIntervals.map((interval) => {
      const newIndex = (noteIndex + interval) % notes.length;
      return notes[newIndex];
    });
  };

  const generateMode = (noteIndex: number, mode: string): NoteData[] => {
    const modeIntervals: { [key: string]: number[] } = {
      Ionian: [0, 2, 4, 5, 7, 9, 11],
      Dorian: [0, 2, 3, 5, 7, 9, 10],
      Phrygian: [0, 1, 3, 5, 7, 8, 10],
      Lydian: [0, 2, 4, 6, 7, 9, 11],
      Mixolydian: [0, 2, 4, 5, 7, 9, 10],
      Aeolian: [0, 2, 3, 5, 7, 8, 10],
      Locrian: [0, 1, 3, 5, 6, 8, 10],
    };

    const intervals = modeIntervals[mode];

    if (!intervals) {
      throw new Error("Invalid mode");
    }

    const modeNotes = intervals.map((interval) => {
      const newIndex = (noteIndex + interval) % notes.length;
      return notes[newIndex];
    });

    return modeNotes;
  };

  const preloadAudio = () => {
    console.log("Preload Audio");
    const baseNote = scale.value;
    const newPlayers = chordNotes.map((note) => {
      const filePath = getNoteFilePath(note.value, baseNote);
      const player = new Tone.Player({
        url: filePath,
        autostart: false,
      }).toDestination();
      return player;
    });

    Promise.all(newPlayers.map((player) => player.loaded))
      .then(() => {
        setPlayers(newPlayers);
      })
      .catch((error) => {
        console.error("Error loading audio files: ", error);
      });
  };

  useEffect(() => {
    if (selectedTool.value === "chordGen")
      setChordNotes(generateChord(scale.value - 1));
    if (selectedTool.value === "greekModes")
      setChordNotes(generateMode(scale.value - 1, selectedGreekMode.value));
  }, [scale, modality, seventh, selectedTool, selectedGreekMode]);

  useEffect(() => {
    preloadAudio();
  }, [chordNotes]);

  return (
    <HarmoniaContext.Provider
      value={{
        test,
        scale,
        setScale,
        modality,
        setModality,
        seventh,
        setSeventh,
        chordNotes,
        setChordNotes,
        audio,
        setAudio,
        players,
        setPlayers,
        getNoteFilePath,
        handleChangeNote,
        playChordSequentially,
        handleChangeScale,
        handleChangeSeventh,
        handleAudioToggle,
        calculatePosition,
        drawChordLines,
        generateChord,
        preloadAudio,
        selectedTool,
        setSelectedTool,
        handleChangeTool,
        generateMode,
        selectedGreekMode,
        setSelectedGreekMode,
        handleChangeGreekMode,
      }}
    >
      {children}
    </HarmoniaContext.Provider>
  );
};

export const useHarmonia = () => {
  const context = useContext(HarmoniaContext);
  if (!context) {
    throw new Error("useHarmonia must be used within a HarmoniaProvider");
  }
  return context;
};
