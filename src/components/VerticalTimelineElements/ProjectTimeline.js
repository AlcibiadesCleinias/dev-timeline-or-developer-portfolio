import { VerticalTimelineElement }  from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

import {Box, Button, Stack, styled, Tooltip} from "@mui/material";
import { useTheme } from '@material-ui/core/styles';
import DashboardIcon from "@material-ui/icons/Dashboard";
import EmojiEventsIcon from "@material-ui/icons/EmojiEvents";

import {serviceNameToIcon} from "../ServiceIcons/mapping";
import {ExternalLinkButton} from "./buttons";
import {prizeColor, projectColor} from "../Constants/colors";

const BootstrapButton = styled(Button)({
  textTransform: 'none',
  margin: 0,
  minWidth: 0
});


function ProjectTimelineElement(props) {
    const { title, subtitle, description, date, publicUrl, moreInfoUrl, stack, additionalTags, isAwarded} = props;
    const theme = useTheme();

    let buttonsHtml = null;
    if (publicUrl || moreInfoUrl) {
      buttonsHtml = (
        <Stack spacing={2} direction="row">
            {publicUrl ? <ExternalLinkButton url={publicUrl}>View</ExternalLinkButton> : null}
            {moreInfoUrl ? <ExternalLinkButton url={moreInfoUrl}>More Info</ExternalLinkButton> : null}
        </Stack>
      );
    }
    let additionalTagsHtml = null;
    if (additionalTags) {
        additionalTagsHtml = (
            <Box sx={{'& > button': {m: 0.1}}}>
                {stack.map((tag, index) => {
                    return (
                        <Tooltip title={tag} arrow key={index}>
                        <BootstrapButton key="1" size="small">
                            {serviceNameToIcon[tag] ?? tag}
                        </BootstrapButton>
                      </Tooltip>
                    )
                })}
            </Box>
        )
    }
    return (
        <VerticalTimelineElement
              className="vertical-timeline-element--work"
              date={date}
              iconStyle={
            isAwarded ?
                // ues theme to get the color
                {background: prizeColor.primary, color: '#fff'} :
                {background: projectColor.primary, color: '#fff'}}
              icon={isAwarded ? <EmojiEventsIcon/> : <DashboardIcon/>}
          >
            {additionalTagsHtml}
            <br/>

            <h3 className="vertical-timeline-element-title">{title}</h3>
            <h4 className="vertical-timeline-element-subtitle">{subtitle}</h4>
            <p>
                {description}
            </p>
            <p>
                {additionalTags.map((tag) => {return `#${tag} `})}
            </p>
            <br/>
            {buttonsHtml}
          </VerticalTimelineElement>
    )
}

export default ProjectTimelineElement;