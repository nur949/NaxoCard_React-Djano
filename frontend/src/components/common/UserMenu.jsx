import { LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu.jsx";

export default function UserMenu({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  function signOut() {
    logout();
    navigate("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-2">
          <p className="text-sm font-bold">{user.first_name || user.username}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/profile"><User className="mr-2" size={16} /> Profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/orders"><Package className="mr-2" size={16} /> Orders</Link></DropdownMenuItem>
        {user.is_staff && <DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="mr-2" size={16} /> Admin</Link></DropdownMenuItem>}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}><LogOut className="mr-2" size={16} /> Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
