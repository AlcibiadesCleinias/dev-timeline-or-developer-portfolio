// TODO: decomposite view
import { VerticalTimeline } from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

import { Link } from "@mui/material";
import EducationTimelineElement from "../components/VerticalTimelineElements/EducationTimeline";
import { timelineData } from "../dataAPIs/timelineData";
import ProjectTimelineElement from "../components/VerticalTimelineElements/ProjectTimeline";
import { useCallback, useState } from "react";
import { FloatingFilters } from "../components/VerticalTimelineElements/Filters";
import WorkTimelineElement from "../components/VerticalTimelineElements/WorkTimeline";
import VimTextBox from "../components/Vim/Vim";
import React from "react";

function TimelineView() {
  const data = timelineData();

  const [showProjects, setShowProjects] = useState(true);
  const [showEducations, setShowEducations] = useState(true);
  const [showPrizes, setShowPrizes] = useState(true);
  const [showWorks, setShowWorks] = useState(true);

  const handleFilterToggle = useCallback((
    {targetState: targetState,
    setTargetStateMethod: setTargetStateMethod,
    isWorks: isWorks = false,
    isEducation: isEducation = false,
    isProjects: isProjects = false,
    isPrizes: isPrizes = false}
  ) => {
    return () => {
      const allActive = showProjects && showEducations && showPrizes && showWorks;
      const allInactive = !showProjects && !showEducations && !showPrizes && !showWorks;

      if (allActive) {
        // When all active and clicking one, disable others except the clicked one
        // For projects, keep prizes active too,
        if (isProjects) {
          setShowProjects(isProjects);
          setShowPrizes(isProjects || isPrizes);
          setShowWorks(false);
          setShowEducations(false);
          return;
        }
        
        if (isEducation) {
          setShowEducations(isEducation);
          // Turn off left.
          setShowProjects(false);
          setShowPrizes(false);
          setShowWorks(false);
          return;
        }

        if (isWorks) {
          setShowWorks(isWorks);
          // Turn off left.
          setShowProjects(false);
          setShowPrizes(false);
          setShowEducations(false);
          return;
        }

        if (isPrizes) {
          setShowPrizes(isPrizes);
          // Turn off left.
          setShowProjects(false);
          setShowEducations(false);
          setShowWorks(false);
          return;
        }
      }

      if (allInactive) {
        // When all inactive and clicking one, enable just that one
        // For projects, enable prizes too.
        setTargetStateMethod(true);
        if (isProjects) {
          setShowPrizes(true);
        }
        return;
      }

      // Can not disable prizes when projects are active.
      if (showProjects && showPrizes && isPrizes) {
        return;
      }

      // When enabling projects, ensure prizes are enabled.
      if (isProjects && !targetState) {
        // Toggle normal case.
        setTargetStateMethod(true);
        setShowPrizes(true);
      } else {
        // Toggle normal case.
        setTargetStateMethod(!targetState);
      }
    };
  }, [showProjects, showEducations, showPrizes, showWorks]);

  const switchProjectsCallback = useCallback(
    handleFilterToggle({
      targetState: showProjects,
      setTargetStateMethod: setShowProjects,
      isProjects: true,
    }),
    [handleFilterToggle, showProjects]
  );

  const switchEducationsCallback = useCallback(
    handleFilterToggle({
      targetState: showEducations,
      setTargetStateMethod: setShowEducations,
      isEducation: true,
    }),
    [handleFilterToggle, showEducations]
  );

  const switchPrizesCallback = useCallback(
    handleFilterToggle({
      targetState: showPrizes,
      setTargetStateMethod: setShowPrizes,
      isPrizes: true,
    }),
    [handleFilterToggle, showPrizes]
  );

  const switchWorksCallback = useCallback(
    handleFilterToggle({
      targetState: showWorks,
      setTargetStateMethod: setShowWorks,
      isWorks: true,
    }),
    [handleFilterToggle, showWorks]
  );

  const timelineDataHtml = data.map((timelineElement, index) => {
    if (timelineElement.dataType === "education") {
      return <EducationTimelineElement key={index} {...timelineElement} />;
    } else if (timelineElement.dataType === "project") {
      return (
        <ProjectTimelineElement
          key={index}
          date={timelineElement.start}
          {...timelineElement}
        />
      );
    } else if (timelineElement.dataType === "work") {
      return <WorkTimelineElement key={index} {...timelineElement} />;
    }
  });

  return (
    <div>
      <div>
        <h1 align={"center"} color={"primary"}>
          Dev Timeline
        </h1>
        <p className="text-white" align={"center"}>
          Projects fetched from{" "}
          <Link
            onClick={() =>
              window.open(
                "https://why-nft.notion.site/Projects-Overview-2de938bb0c4b476cb56229f620ac49e9",
                "_blank",
              )
            }
          >
            Notion Database
          </Link>
          <br />
          Other information from the CV
        </p>
      </div>

      <VerticalTimeline>
        {timelineDataHtml.map((element, _) => {
          if (element.props.dataType === "work" && showWorks) {
            return element;
          }
          if (
            element.props.dataType === "project" &&
            showProjects &&
            (!element.props.isAwarded || showPrizes || !showPrizes)
          ) {
            return element;
          }
          if (
            element.props.dataType === "project" &&
            showPrizes &&
            element.props.isAwarded
          ) {
            return element;
          }
          if (element.props.dataType === "education" && showEducations) {
            return element;
          }
        })}
      </VerticalTimeline>
      {!showWorks && !showProjects && !showEducations && !showPrizes ? (
        <VimTextBox
          content={
            '"""Web3 is simple they said."""' +
            "\n" +
            "\n" +
            "from secrets import token_bytes\n" +
            "from coincurve import PublicKey\n" +
            "from sha3 import keccak_256\n" +
            "private_key = keccak_256(token_bytes(32)).digest()\n" +
            "public_key = PublicKey.from_valid_secret(private_key).format(compressed=False)[1:]\n" +
            "\n" +
            "# Ref to https://ethereum.github.io/yellowpaper/paper.pdf" +
            "\n" +
            "addr = keccak_256(public_key).digest()[-20:]\n" +
            "\n" +
            "print('private_key:', private_key.hex())\n" +
            "print('eth addr: 0x' + addr.hex())"
          }
          language="python"
        />
      ) : null}
      <FloatingFilters
        switchProjects={switchProjectsCallback}
        switchEducations={switchEducationsCallback}
        switchPrizes={switchPrizesCallback}
        showProjects={showProjects}
        showEducations={showEducations}
        showPrizes={showPrizes}
        showWorks={showWorks}
        switchWorks={switchWorksCallback}
      />
    </div>
  );
}

export default TimelineView;
