import SidebarIcon from "./SidebarIcon";
import HomeIcon from "../assets/sidebarIcons/home.tsx";
import CapturesIcon from "../assets/sidebarIcons/mydetections.tsx";
import EncyclopediaIcon from "../assets/sidebarIcons/encyclopedia.tsx";
import MapIcon from "../assets/sidebarIcons/mapIcon.tsx";
import ProfileIcon from "../assets/sidebarIcons/profileIcon.tsx";
import GaleryIcon from "../assets/sidebarIcons/galery.tsx";
import { useAuth } from "../context/AuthContext";

export default function Bottombar(){
    const { user } = useAuth();
    const isGuest = !user;
    const isAdmin = user?.rol === "admin";

    return(
        <div className="fixed h-12 w-full bg-[#152C28]/80 text-white flex flex-row bottom-0 shadow-lg z-10 items-center md:hidden">
            <nav className="flex flex-row gap-2 w-full justify-center">
                <SidebarIcon to="/captures" id="capturesIcon" icon={CapturesIcon} disabled={isGuest} />
                <SidebarIcon to="/map" id="mapIcon" icon={MapIcon} disabled={isGuest} />
                <SidebarIcon to="/" id="homeIcon" icon={HomeIcon} />
                <SidebarIcon to="/encyclopedia" id="encyclopediaIcon" icon={EncyclopediaIcon} />
                {isAdmin && (
                  <SidebarIcon to="/galery" id="galeryIcon" icon={GaleryIcon} />
                )}
                <SidebarIcon to="/profile" id="profileIcon" icon={ProfileIcon} showBadge={isGuest} />
            </nav>
        </div>
    )
}