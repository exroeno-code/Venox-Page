/** Learning programmes shown on /learning and accepted by the application form. */
export type LevelId = "degree" | "diploma" | "certificate";
export type Programme = { name: string; focus?: string };

export const LEVELS: readonly {
  id: LevelId;
  label: string;
  blurb: string;
  programmes: readonly Programme[];
}[] = [
  {
    id: "degree",
    label: "Degree",
    blurb: "Bachelor-level computing and engineering programmes.",
    programmes: [
      { name: "Bachelor of Science in Computer Science" },
      { name: "Bachelor of Science in Information Technology (IT)" },
      { name: "Bachelor of Business Information Technology (BBIT)" },
      { name: "Bachelor of Science in Software Engineering", focus: "Large-scale software architecture, coding and testing." },
      { name: "Bachelor of Science in Applied Computer Technology" },
      { name: "Bachelor of Science in Computer Security and Forensics (Cybersecurity)" },
      { name: "Bachelor of Science in Data Science and Analytics" },
      { name: "Bachelor of Science in Artificial Intelligence and Machine Learning" },
      { name: "Bachelor of Science in Computer Engineering", focus: "Computer hardware, microprocessors and embedded systems." },
      { name: "Bachelor of Science in Information Systems" },
      { name: "Bachelor of Science in Telecommunication and Information Engineering", focus: "Networks, wireless communication and signal processing." },
      { name: "Bachelor of Science in Electronic and Computer Engineering", focus: "Electronics, circuit design and computing systems." },
      { name: "Bachelor of Science in Mechatronic Engineering", focus: "Mechanical engineering, electronics, robotics and computer control." },
      { name: "Bachelor of Science in Health Records and Information Management" },
      { name: "Bachelor of Technology (BTech) in Information Technology" },
      { name: "Bachelor of Technology (BTech) in Computer and Electronic Systems" },
      { name: "Bachelor of Technology (BTech) in Communication and Computer Networks" },
    ],
  },
  {
    id: "diploma",
    label: "Diploma",
    blurb: "Practical diploma-level programmes.",
    programmes: [
      { name: "Diploma in Computer Science" },
      { name: "Diploma in Information Technology (IT)" },
      { name: "Diploma in Business Information Technology (DBIT)" },
      { name: "Diploma in Software Engineering" },
      { name: "Diploma in Cybersecurity and Ethical Hacking" },
      { name: "Diploma in Computer Engineering" },
      { name: "Diploma in Telecommunication Engineering" },
      { name: "Diploma in Electronics and Computer Engineering" },
      { name: "Diploma in Computer Networks and Systems Administration" },
    ],
  },
  {
    id: "certificate",
    label: "Certificate",
    blurb: "Entry-level certificates and short courses.",
    programmes: [
      { name: "Certificate in Information Technology" },
      { name: "Certificate in Computer Science" },
      { name: "Certificate in Computer Applications (Short Courses)" },
    ],
  },
];

export function findProgramme(level: string, name: string): Programme | undefined {
  return LEVELS.find((l) => l.id === level)?.programmes.find((p) => p.name === name);
}
