import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePageTitle } from "../../../../hooks/usePageTitle";
import { request } from "../../../../utils/api";
import {useAuthentication } from "../../../authentication/contexts/AuthenticationContextProvider";
import { About } from "../../components/About/About";
import { Activity } from "../../components/Activity/Activity";
import { Header } from "../../components/Header/Header";
import "./Profile.css";
import { RightSidebar } from "../../../feed/components/RightSideBar/RightSideBar";
import { Loader } from "../../../../components/loader/Loader";

export function Profile() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const { user: authUser, setUser: setAuthUser } = useAuthentication();
  const [user, setUser] = useState(null);

  usePageTitle(user?.firstName + " " + user?.lastName);

  useEffect(() => {
    setLoading(true);
    if (id === authUser?.id) {
      setUser(authUser);
      setLoading(false);
    } else {
      request({
        endpoint: `/api/v1/authentication/users/${id}`,
        onSuccess: (data) => {
          setUser(data);
          setLoading(false);
        },
        onFailure: (error) => console.log(error),
      });
    }
  }, [authUser, id]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="prof-profile">
      <section className="prof-main">
        <Header user={user} authUser={authUser} onUpdate={(user) => setAuthUser(user)} />
        <About user={user} authUser={authUser} onUpdate={(user) => setAuthUser(user)} />
        <Activity authUser={authUser} user={user} id={id} />

        <div className="prof-experience">
          <h2>Experience</h2>
          <p>TODO</p>
        </div>
        <div className="prof-education">
          <h2>Education</h2>
          <p>TODO</p>
        </div>
        <div className="prof-skills">
          <h2>Skills</h2>
          <p>TODO</p>
        </div>
      </section>
      <div className="prof-sidebar">
        <RightSidebar />
      </div>
    </div>
  );
}
