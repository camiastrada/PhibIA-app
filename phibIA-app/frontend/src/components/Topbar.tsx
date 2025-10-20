import { Link } from "react-router-dom";
import ProfileIcon from "../assets/sidebarIcons/profileIcon1.png"

export default function Topbar(){
    return(
        <div className="fixed h-20 w-full bg-[#152C28]/70 text-white flex flex-row top-0 shadow-lg z-10 items-center md:hidden">
            <div id="profileSection" className="absolute right-4 size-12 bg-slate-300 rounded-full flex items-center justify-center border-3 border-white">
                <Link
                    to="/profile"
                    id="profileIcon">
                    <img
                    src={ProfileIcon}
                    alt="Profile"
                    className="size-12 rounded-full"
                    />
                </Link>
            </div>
        </div>
    )
}