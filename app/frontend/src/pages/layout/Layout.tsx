import { Outlet, NavLink, Link } from "react-router-dom";

import logo from "../../assets/logo-beacon.png";
import PANYNJlogo from "../../assets/logo-panynj.png";

import styles from "./Layout.module.css";

import { useLogin } from "../../authConfig";

import { LoginButton } from "../../components/LoginButton";

const Layout = () => {
    return (
        <div className={styles.layout}>
            <header className={styles.header} role={"banner"}>
                <div className={styles.headerContainer}>
                    <ul className={styles.headerNavList}>
                        <li>
                            <a href="/" target={"_self"} title="Link - BEACON homepage">
                                {" "}
                                <img src={logo} alt="BEACON logo" aria-label="BEACON homepage" width="70px" height="auto" className={styles.siteLogo} />
                            </a>
                        </li>
                        <li>
                            <Link to="/" className={styles.headerTitleContainer}>
                                <h1 className={styles.headerTitle}>BEACON</h1>
                                <h3 className={styles.headerSubTitle}>Building Economic Alliances Chatbot Online Navigator</h3>
                            </Link>
                        </li>
                    </ul>
                    <a href="https://www.panynj.gov/port-authority/en/business-opportunities.html" target={"_blank"} title="Link - PANYNJ website">
                        {" "}
                        <img src={PANYNJlogo} alt="PANYNJ logo" aria-label="PANYNJ homepage" width="100px" height="auto" className={styles.headerRightImage} />
                    </a>
                    {/* <nav>
                        <ul className={styles.headerNavList}>
                            <li>
                                <NavLink to="/" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Chat
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <NavLink to="/qa" className={({ isActive }) => (isActive ? styles.headerNavPageLinkActive : styles.headerNavPageLink)}>
                                    Ask a question
                                </NavLink>
                            </li>
                            <li className={styles.headerNavLeftMargin}>
                                <a href="https://aka.ms/entgptsearch" target={"_blank"} title="Github repository link">
                                    <img
                                        src={github}
                                        alt="Github logo"
                                        aria-label="Link to github repository"
                                        width="20px"
                                        height="20px"
                                        className={styles.githubLogo}
                                    />
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <h4 className={styles.headerRightText}>Azure OpenAI + Cognitive Search</h4> */}
                    {useLogin && <LoginButton />}
                </div>
            </header>

            <Outlet />
        </div>
    );
};

export default Layout;
