import React from 'react';
import { withStyles } from '@material-ui/styles';
import Tooltip, { TooltipProps } from '@material-ui/core/Tooltip';

const StyledTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[3],
    borderRadius: 0,
    fontSize: 12,
    fontWeight: 400,
  },
}))(Tooltip);

const AphTooltip: React.FC<TooltipProps> = (props) => {
  return <StyledTooltip {...props} />;
};

export default AphTooltip;
