import avatar1 from "../../assets/profileIcons/profileIcon1.png";
import avatar2 from "../../assets/profileIcons/profileIcon2.png";
import avatar3 from "../../assets/profileIcons/profileIcon3.png";
import avatar4 from "../../assets/profileIcons/profileIcon4.png";
import avatar5 from "../../assets/profileIcons/profileIcon5.png";
import avatar6 from "../../assets/profileIcons/profileIcon6.png";
import avatar7 from "../../assets/profileIcons/profileIcon7.png";
import avatar8 from "../../assets/profileIcons/profileIcon8.png";
import avatar9 from "../../assets/profileIcons/profileIcon9.png";
import avatar10 from "../../assets/profileIcons/profileIcon10.png";
import avatar11 from "../../assets/profileIcons/profileIcon11.png";

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
  { id: 5, name: "Ranita piadora", src: avatar6 },
  { id: 6, name: "Ranita piadora", src: avatar7 },
  { id: 7, name: "Ranita piadora", src: avatar8 },
  { id: 8, name: "Ranita piadora", src: avatar9 },
  { id: 9, name: "Ranita piadora", src: avatar10 },
  { id: 10, name: "Ranita piadora", src: avatar11 },
];
