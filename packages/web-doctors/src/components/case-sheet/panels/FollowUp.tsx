import { KeyboardDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { fontWeight } from '@material-ui/system';
import { CaseSheetContext } from 'context/CaseSheetContext';

const useStyles = makeStyles(() => ({
  followUpContainer: {
    width: '100%',
    '& .followup-label': {
      color: 'rgba(2,71,91,0.6)',
      fontSize: 12,
      marginTop: 5,
      '&.first-label': {
        paddingLeft: 60,
      },
      '&.last-label': {
        paddingRight: 40,
        paddingTop: 9,
      },
      display: 'inline-block',
      textAlign: 'center',
    },
  },
  switchBtn: {
    position: 'absolute',
    right: 10,
  },
  followupTxt: {
    fontSize: 14,
    color: 'rgba(2, 71, 91, 0.6)',
    fontWeight: 500,
    marginBottom: 16,
    display: 'inline-block',
  },
  followupAfter: {
    paddingTop: 16,
  },
  followup: {
    '& h5': {
      fontSize: 14,
      color: 'rgba(2, 71, 91, 0.6)',
      fontWeight: 500,
      paddingBottom: 8,
    },
  },
  button: {
    borderRadius: '5px',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
    border: 'solid 1px #00b38e',
    backgroundColor: '#ffffff',
    color: '#00b38e',
    marginRight: 10,
    '&.Mui-selected': {
      color: '#ffffff',
      backgroundColor: '#00b38e !important',
    },
    '&:first-child': {
      borderRadius: 5,
    },
    '&:last-child': {
      borderRadius: 5,
      border: 'solid 1px #00b38e',
    },
    '&.markLabel': {
      color: '#02475b',
      fontSize: 12,
      fontWeight: 'normal',
    },
  },
  recommendedType: {
    marginTop: 25,
    marginBottom: 10,
  },
  datepicker: {
    '& div': {
      '&:before': {
        // borderBottom: '#f7f7f7 !important',
      },
      '&:after': {
        // borderBottom: '#f7f7f7 !important',
      },
    },

    '& input': {
      color: '#02475b',
      fontSize: 18,
      fontWeight: 600,
      borderBottom: 'none',
      '&:hover': {
        // borderBottom: 'none',
        '&:before': {
          // borderBottom: 'none',
        },
      },
      '&:before': {
        // borderBottom: 'none',
      },
      '&:after': {
        // borderBottom: 'none',
      },
    },
  },
  datePickerOpen: {
    '& input': {
      background: `url(${require('images/ic_cal_up.svg')}) no-repeat right center`,
      cursor: 'pointer',
      backgroundSize: 30,
    },
  },
  datePickerClose: {
    '& input': {
      'background-image': `url(${require('images/ic_cal_down.svg')})`,
      backgroundSize: 30,
    },
  },
}));

const marks = [
  {
    value: 2,
    label: (
      <span className="followup-label first-label">
        2<br />
        days
      </span>
    ),
  },
  {
    value: 5,
    label: (
      <span className="followup-label">
        5<br />
        days
      </span>
    ),
  },
  {
    value: 7,
    label: (
      <span className="followup-label">
        7<br />
        days
      </span>
    ),
  },
  {
    value: 9,
    label: <span className="followup-label last-label">Custom</span>,
  },
];

const valuetext = (value: number) => {
  return `${value} days`;
};

const PrettoSlider = withStyles({
  root: {
    color: '#52af77',
    height: 8,
  },
  thumb: {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    marginTop: -8,
    marginLeft: -12,
    '&:focus,&:hover,&$active': {
      boxShadow: 'inherit',
    },
  },
  active: {},
  valueLabel: {
    left: 'calc(-50% + 4px)',
  },
  track: {
    height: 8,
    borderRadius: 4,
  },
  rail: {
    height: 8,
    borderRadius: 4,
  },
  // markLabel: {
  //   width: '10px',
  //   display: 'inline-block',
  //   whiteSpace: 'normal',
  // '&::after': {
  //   content: '"days"',
  //   display: 'block'
  // },
  // '&:nth-child(5)': {
  //   paddingLeft: '70px'
  // },
  // '&:nth-last-child(2)::after': {
  //   content: '""'
  // }
  // }
})(Slider);

const defaultMaterialTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#00b38e',
    },
    text: {
      primary: '#00b38e',
    },
    action: {
      selected: '#fff',
    },
  },
  typography: {
    fontWeightMedium: 600,
    htmlFontSize: 14,
    fontFamily: ['IBM Plex Sans', 'sans-serif'].join(','),
    body1: {
      fontSize: 16,
      color: '#02475b',
      fontWeight: 700,
    },
    body2: {
      fontWeight: 600,
    },
    caption: {
      fontSize: 12,
      color: '#80a3ad !important',
      fontWeight: 600,
    },
  },
});
export const FollowUp: React.FC = () => {
  const classes = useStyles();
  const {
    consultType: consultTypeData,
    setConsultType: setConsultTypeData,
    followUp,
    setFollowUp,
    followUpAfterInDays,
    setFollowUpAfterInDays,
    followUpDate,
    setFollowUpDate,
  } = useContext(CaseSheetContext);
  const [shouldFollowUp, setShouldFollowUp] = useState<boolean>(!!followUp[0]);
  const [followUpDays, setFollowUpDays] = useState<number>(
    parseInt(followUpAfterInDays[0], 10) || 2
  );
  const [consultType, setConsultType] = useState<string>(consultTypeData[0]);
  const [selectedDate, handleDateChange] = useState<Date>(
    followUpDate[0] ? new Date(followUpDate[0]) : new Date()
  );

  useEffect(() => {
    if (!shouldFollowUp) {
      handleDateChange(new Date());
      setFollowUpDays(2);
      setConsultType('');
    }
  }, [shouldFollowUp]);

  useEffect(() => {
    consultTypeData[0] = consultType;
    setConsultTypeData(consultTypeData);

    followUp[0] = shouldFollowUp;
    setFollowUp(followUp);

    followUpAfterInDays[0] = `${followUpDays === 9 ? 'Custom' : followUpDays}`;
    setFollowUpAfterInDays(followUpAfterInDays);

    followUpDate[0] = `${followUpDays === 9 ? selectedDate : ''}`;
    setFollowUpDate(followUpDate);
  }, [consultType, shouldFollowUp, followUpDays, selectedDate]);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Typography component="div" className={classes.followUpContainer}>
        <Typography component="div">
          <Typography component="span" className={classes.followupTxt}>
            Do you recommend a follow up?
          </Typography>
          <Switch
            checked={shouldFollowUp}
            onChange={(e) => setShouldFollowUp(e.target.checked)}
            value="followup"
            color="primary"
            className={classes.switchBtn}
          />
        </Typography>
        {shouldFollowUp && (
          <div className={classes.followup}>
            <Divider />
            <Typography className={classes.followupAfter} component="div">
              <Typography component="h5" variant="h5">
                Follow Up After
              </Typography>
              <PrettoSlider
                getAriaValueText={valuetext}
                step={null}
                marks={marks}
                min={2}
                max={9}
                onChange={debounce((e, value) => setFollowUpDays(value), 200)}
              />
              {followUpDays === 9 && (
                <div className={classes.recommendedType}>
                  <Typography component="h5" variant="h5">
                    Follow Up On
                  </Typography>
                  <ThemeProvider theme={defaultMaterialTheme}>
                    <KeyboardDatePicker
                      disableToolbar
                      className={classes.datepicker}
                      autoOk
                      placeholder="dd/mm/yyyy"
                      variant="inline"
                      format="dd/MM/yyyy"
                      value={selectedDate}
                      InputAdornmentProps={{ position: 'end' }}
                      onChange={(date) => handleDateChange((date as unknown) as Date)}
                    />
                  </ThemeProvider>
                </div>
              )}
            </Typography>
            <Typography component="div" className={classes.recommendedType}>
              <Typography component="h5" variant="h5">
                Recommended Consult Type
              </Typography>
              <Typography component="div">
                <ToggleButtonGroup
                  exclusive
                  value={consultType}
                  onChange={(e, newValue) => setConsultType(newValue)}
                >
                  <ToggleButton value="ONLINE" className={classes.button}>
                    <img src={require('images/ic_video.svg')} alt="" /> online
                  </ToggleButton>
                  </ToggleButton>
          </div>
  );
};
