"use client";

import Link from "next/link";

export function CustomHeader() {
  return (
    <header
      className="fr-header"
      style={{
        backgroundColor: "#FFFFFF",
        paddingTop: "0.75rem",
        paddingBottom: "0.75rem",
      }}
    >
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <div className="fr-header__brand fr-enlarge-link">
              <div
                className="fr-header__brand-top"
                style={{ marginBottom: "0.25rem" }}
              >
                <div className="fr-header__logo">
                  <p className="fr-logo" style={{ fontSize: "0.875rem" }}>
                    RÉPUBLIQUE
                    <br />
                    FRANÇAISE
                  </p>
                </div>
                <div className="fr-header__operator">
                  <span className="explore-logo">
                    <span
                      style={{
                        fontStyle: "italic",
                        fontWeight: "normal",
                        color: "#161616",
                        fontSize: "1rem",
                      }}
                    >
                      explore
                    </span>
                    <span
                      style={{
                        fontStyle: "italic",
                        fontWeight: "bold",
                        color: "#161616",
                        fontSize: "1rem",
                      }}
                    >
                      .data.gouv
                    </span>
                    <span
                      style={{
                        fontStyle: "italic",
                        fontWeight: "normal",
                        color: "#161616",
                        fontSize: "1rem",
                      }}
                    >
                      .fr
                    </span>
                  </span>
                </div>
              </div>
              <div className="fr-header__service">
                <Link
                  href="/"
                  title="Accueil - Tableau de bord Grippe"
                  style={{ textDecoration: "none" }}
                >
                  <p
                    className="fr-header__service-title"
                    style={{
                      color: "#161616",
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      lineHeight: "1.2",
                      marginBottom: "0.125rem",
                      marginTop: 0,
                    }}
                  >
                    Tableau de bord Grippe{" "}
                    <span
                      className="fr-badge fr-badge--success"
                      style={{
                        backgroundColor: "#18753C",
                        color: "#FFFFFF",
                        fontSize: "0.75rem",
                        marginLeft: "0.5rem",
                        verticalAlign: "middle",
                        padding: "0.125rem 0.5rem",
                      }}
                    >
                      BETA
                    </span>
                  </p>
                </Link>
                <p
                  className="fr-header__service-tagline"
                  style={{
                    color: "#666666",
                    fontSize: "0.9rem",
                    lineHeight: "1.3",
                    marginTop: 0,
                    marginBottom: 0,
                  }}
                >
                  Suivi de l'épidémie et de la vaccination en France
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
