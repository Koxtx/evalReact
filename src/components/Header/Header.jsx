import { useContext } from "react";
import styles from "./Header.module.scss";
import { NavLink } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

function Header() {
  const { user } = useContext(UserContext);
  console.log(user);
  return (
    <header className={`${styles.header} d-flex flex-row align-items-center`}>
      <div className="flex-fill">
        <NavLink end to="/">
          <strong> Video Vibe </strong>
        </NavLink>
      </div>
      <ul className={styles.headerList}>
        {user ? (
          <>
            <NavLink className="mr-15" to="profile">
              <span>Profile</span>
            </NavLink>
            <NavLink className="mr-15" to="logout">
              <span>Logout</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink className="mr-15" to="register">
              <span>Register</span>
            </NavLink>
            <NavLink className="mr-15" to="login">
              <span>Login</span>
            </NavLink>
          </>
        )}
      </ul>
    </header>
  );
}

export default Header;
