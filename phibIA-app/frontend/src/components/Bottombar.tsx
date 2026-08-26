import SidebarIcon from "./SidebarIcon";
import HomeIcon from "../assets/sidebarIcons/home.tsx";
import CapturesIcon from "../assets/sidebarIcons/mydetections.tsx";
import EncyclopediaIcon from "../assets/sidebarIcons/encyclopedia.tsx";

export default function Bottombar(){
    return(
        <div className="fixed h-12 w-full bg-[#152C28]/80 text-white flex flex-row bottom-0 shadow-lg z-10 items-center md:hidden">
            <nav className="flex flex-row gap-4 w-full justify-center">
                <SidebarIcon
                    to="/captures"
                    id="capturesIcon"
                    icon={CapturesIcon} />
                <SidebarIcon
                    to="/"
                    id="homeIcon"
                    icon={HomeIcon} />
                <SidebarIcon
                    to="/encyclopedia"
                    id="encyclopediaIcon"
                    icon={EncyclopediaIcon} />  
            </nav>
        </div>
    )
}