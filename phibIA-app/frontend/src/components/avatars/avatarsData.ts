import avatar1 from "../../assets/profileIcons/profileIcon1.png";
import avatar2 from "../../assets/profileIcons/profileIcon2.png";
import avatar3 from "../../assets/profileIcons/profileIcon3.png";
import avatar4 from "../../assets/profileIcons/profileIcon4.png";
import avatar5 from "../../assets/profileIcons/profileIcon5.png";

export interface AvatarData {
  id: number;
  name: string;
  src: string;
}

export const avatarsData: AvatarData[] = [
  { id: 0, name: "Sapo común", src: avatar1 },
  { id: 1, name: "Escuercito", src: avatar2 },
  { id: 2, name: "Ranita trepadora", src: avatar3 },
  { id: 3, name: "Escuerzo", src: avatar4 },
  { id: 4, name: "Ranita rayada", src: avatar5 },
];
