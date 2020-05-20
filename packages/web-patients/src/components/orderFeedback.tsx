import React, { useState, useRef, useEffect } from "react";
import { makeStyles, withStyles } from "@material-ui/styles";
import { Theme, Typography, Link } from "@material-ui/core";
import { Header } from "components/Header";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Button from "@material-ui/core/Button";
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';

const success = require("../images/completed.png");

const useStyles = makeStyles((theme: Theme) => {
  return {
    root: {},
    container: {
      maxWidth: 1064,
      margin: "auto"
    },
    orderFeedbackContainer: {
      background: "#f7f8f5",
      padding: 20,
      borderRadius: "0 0 10px 10px",
      height: "100%"
    },
    sectionHeader: {
      padding: "10px 0`",
      borderBottom: "0.5px solid rgba(2,71,91,0.3)",
      margin: "0 0 10px",
      "& h3": {
        fontSize: 14,
        fontFamily: "IBM Plex Sans",
        fontWeight: "bold",
        color: "#01475b",
        lineHeight: '23px',
      },
      [theme.breakpoints.down("sm")]: {
        display: "none"
      }
    },
    paymentContainer: {
      height: "100%"
    },
    paper: {
      borderRadius: 5,
      padding: "15px 20px",
      boxShadow: "none",
      height: "100%"
    },
    paperHeading: {
      padding: "0 0 10px",
      borderBottom: "0.5px solid rgba(2,71,91,0.3)",
      margin: "0 0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "& h3": {
        fontSize: 12,
        fontFamily: "IBM Plex Sans",
        fontWeight: "bold",
        textTransform: "uppercase",
        color: "#01475b"
      }
    },
    orderStatusContainer: {},
    orderList: {
      padding: 0,
      listStyle: "none",
      "& li": {
        margin: "0 0 10px",
        border: "1px solid transparent",
        borderRadius: 5
      }
    },
    order: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: "#fff",
      borderRadius: 5,
      padding: 10
    },
    orderContent: {
      "& >p": {
        fontSize: 14,
        fontFamily: "IBM Plex Sans",
        fontWeight: "bold",
        color: "#02475b"
      }
    },
    orderDetails: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "& p": {
        fontSize: 10,
        color: "#658f9b",
        lineHeight: "normal",
        "&:first-child": {
          padding: "0 10px 0 0",
          margin: "0 10px 0 0",
          borderRight: "1px solid rgba(2, 71, 91, .3)"
        }
      }
    },
    orderPlacedContainer: {
      "& >p": {
        fontSize: 12,
        fontFamily: "IBM Plex Sans",
        fontWeight: "bold",
        color: "#02475b"
      }
    },
    orderSelected: {
      borderColor: "#00b38e !important",
      position: "relative",
      "&:before": {
        content: "''",
        position: "absolute",
        top: 20,
        right: -16,
        border: "8px solid transparent",
        borderLeftColor: "#00b38e"
      },
      "&:after": {
        content: "''",
        position: "absolute",
        top: 20,
        right: -15,
        border: "8px solid transparent",
        borderLeftColor: "#fff"
      }
    },
    slider: {},
    statusContainer: {
      background: "#f7f8f5",
      height: "calc(100% - 40px)"
    },
    tabsContainer: {
      minHeight: "auto",
      borderBottom: "1px solid rgba(2, 71, 91, .2)"
    },
    tab: {
      padding: 10,
      minWidth: "50%",
      background: "transparent",
      fontSize: 14,
      fontFamily: "IBM Plex Sans",
      fontWeight: "bold",
      textTransform: "capitalize"
    },
    tabPanel: {},
    flex: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between"
    },
    blueText: {
      color: "#00b38e"
    },
    redText: {
      color: "#890000"
    },
    fontBold: {
      fontWeight: "bold"
    },
    trackContent: {
      padding: 16,
      "& *": {
        fontSize: 12
      },
      "& h3": {
        fontWeight: "bold"
      }
    },
    trackOrderContent: {
      padding: "14px 0",
      borderTop: "1px solid rgba(2, 71, 91, .2)",
      "& h3": {
        fontSize: 12
      }
    },
    orderStatus: {
      padding: 16,
      boxShadow: "0 1px 3px 0 rgba(128, 128, 128, 0.3)",
      display: "flex",
      alignItems: "center",
      "& img": {
        margin: "0 20px 0 0"
      },
      "& p": {
        fontSize: 12,
        fontWeight: "bold"
      }
    },
    orderStages: {
      padding: "20px 20px 20px 40px",
      listStyle: "none",
      margin: 0,
      "& li": {
        padding: "0 0 10px",
        position: "relative",
        "& >p": {
          display: "none",
          fontSize: 10,
          color: "#02475b",
          padding: "0 10px"
        },
        "&:after": {
          content: "''",
          position: "absolute",
          top: 5,
          left: -20,
          bottom: 0,
          width: 4,
          height: "100%",
          background: "rgba(0, 179, 142, .2)",
          zIndex: 0
        },
        "&:last-child": {
          "&:after": {
            display: "none"
          }
        }
      }
    },
    tcCard: {
      padding: 15,
      borderRadius: 5,
      boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.2)",
      "& h3": {
        fontSize: 14,
        fontFamily: "IBM Plex Sans",
        fontWeight: "bold",
        padding: "0 0 10px",
        margin: "0 0 10px",
        borderBottom: "1px solid rgba(2, 71, 91, .2)"
      },
      "& p": {
        fontSize: 12,
        fontWeight: "bold"
      }
    },
    tcCardActive: {
      background: "#fff"
    },
    statusTag: {
      padding: "5px 20px",
      background: "rgba(0, 179, 142, .2)",
      fontSize: 12,
      color: "#02475b",
      borderRadius: 16,
      fontWeight: "bold"
    },
    delivered: {
      padding: "14px 20px",
      borderTop: "1px solid rgba(2, 71, 91, .2)",
      "& p": {
        fontSize: 12,
        fontWeight: "500"
      },
      "& h4": {
        fontSize: 14,
        fontWeight: "bold",
        margin: "10px 0"
      }
    },
    stageActive: {
      "& >p": {
        display: "block !important"
      },
      "&:after": {
        background: "#0087ba !important"
      }
    },
    stage: {
      width: 14,
      height: 14,
      display: "block",
      borderRadius: "50%",
      background: "rgba(2, 71, 91, .3)",
      position: "absolute",
      top: 0,
      left: -25,
      zIndex: 2,
      "&:before": {
        content: "''",
        position: "absolute",
        top: 2,
        left: 2,
        width: 10,
        height: 10,
        background: "#02475b",
        borderRadius: "50%"
      }
    },
    stageCompleted: {
      background: "transparent",
      "&:before": {
        top: "0px !important",
        left: "-7px !important",
        width: "28px !important",
        height: "28px !important",
        background: `url( ${success}) !important`
      }
    },
    orderSummaryContainer: {
      background: "#fff",
      borderRadius: 10,
      padding: "20px 0",
      margin: 20
    },
    summaryHeader: {
      padding: "0 14px 10px",
      margin: "0 0 10px",
      borderBottom: "1px solid rgba(2, 71, 91, .2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      "& *": {
        fontSize: 12,
        fontWeight: "bold"
      }
    },
    font10: {
      fontSize: 10
    },
    shippingDetails: {
      padding: "20px 0",
      "& h3": {
        fontSize: 12,
        textTransform: "uppercase",
        padding: "0 14px 10px",
        margin: "0 0 10px",
        borderBottom: "1px solid rgba(2, 71, 91, .2)"
      },
      "& p": {
        fontSize: 12
      }
    },
    itemContainer: {

    },
    px14:{
      padding: '0 14px',
    },
    itemHead: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 14px 10px",
      margin: "0 0 10px",
      borderBottom: "1px solid rgba(2, 71, 91, .2)",
      "& h3": {
        textTransform: "uppercase",
        fontSize: 12
      },
      "& p": {
        fontSize: 10
      }
    },
    itemContent: {
      padding: '10px 14px',
      "& h3": {
        fontSize: 12,
        textTransform: "uppercase",
      },
      "& p": {
        fontSize: 12,
        fontWeight: "bold",
        padding: "5px 0"
      }
    },
    paymentContent: {
      paddingTop: 10,
      "& h3": {
        fontSize: 12,
        textTransform: "uppercase",
        padding: "0 14px 10px",
        margin: "0 0 10px",
        borderBottom: "1px solid rgba(2, 71, 91, .2)"
      },
      "& p": {
        fontSize: 12,
        padding: '5px 0'
      }
    },
    summaryBottom: {
      padding:'0 40px'
    },
    btnContent: {
      marginTop: 20,
      "& button": {
        display: 'block',
        background: '#fff',
        color: '#fc9916',
        fontSize: 14,
        textTransform: 'uppercase',
        padding:10,
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        width:160,
        margin: '0px auto 15px',
        fontWeight: 'bold'
      }
    },
    total:{
      padding: '10px 0 0',
      margin: '10px 0 0',
      borderTop: "1px solid rgba(2, 71, 91, .2)",
      '& p': {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        padding: 0,
        lineHeight: '14px',
      }
    },
    p0:{
      padding:'0 !important'
    },
    bottomPopover: {
      overflow: 'initial',
      backgroundColor: 'transparent',
      boxShadow: 'none',
      [theme.breakpoints.down('xs')]: {
        left: '0px !important',
        maxWidth: '100%',
        width: '100%',
        top: '38px !important',
      },
    },
    feedbackPopoverWindow: {
      display: 'flex',
      marginRight: 5,
      marginBottom: 5,
      '& h3': {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#02475b',
        margin: '0 0 10px'
      },
      '& h4': {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0087ba',
      }
    },
    windowWrap: {
      width: 368,
      borderRadius: 10,
      padding: 20,
      boxShadow: '0 5px 40px 0 rgba(0, 0, 0, 0.3)',
      backgroundColor: theme.palette.common.white,
    },
    mascotIcon: {
      position: 'absolute',
      right: 12,
      top: -40,
      '& img': {
        maxWidth: 80,
      },
    },
    deliveryDetails:{
      background: '#f7f8f5',
      padding: 20,
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0',
    },
    iconContainer:{
      width:40,
      height:40,
      background: '#fff',
      borderRadius: '50%',
      display: 'flex',
      alignItems:'center',
      justifyContent: 'center',
      margin: '0 20px 0 0',
    },
    feedbackList: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '20px 0',
      listStyle:'none',
      padding:0,
      '& li':{
        fontSize: 12,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign: 'center'
      },
    },
    suggestion:{
      margin: '20px 0 0',
      padding: '20px 0 0',
      borderTop: "1px solid rgba(2, 71, 91, .2)",
      '& h4':{
        fontSize: 14,
        fontWeight: 'bold',
      },
      "& button": {
        display: 'block',
        background: '#fc9916',
        color: '#fff',
        fontSize: 14,
        textTransform: 'uppercase',
        padding:10,
        borderRadius: 10,
        boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        width:160,
        margin: '0px auto',
        fontWeight: 'bold'
      }
    },
    textInput: {
      margin: '10px 0 30px',
      width: '100%',
    },
    thankyou: {
      '& h3': {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#02475b',
        margin: '0 0 10px'
      },
      '& h4': {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#0087ba',
        margin: '0 0 20px',
      },
      '& a':{
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        textAlign:'right'
      }
    },
      };
});
const PrettoSlider = withStyles({
  root: {
    color: "#0087ba",
    height: 4,
    width: 250
  },
  thumb: {
    height: 20,
    width: 20,
    backgroundColor: "#fff",
    border: "2px solid #00b38e",
    marginTop: -8,
    marginLeft: -12,
    "&:focus, &:hover, &$active": {
      boxShadow: "inherit"
    }
  },
  active: {},
  valueLabel: {
    left: "calc(-50% + 4px)"
  },
  track: {
    height: 4,
    borderRadius: 4
  },
  rail: {
    height: 4,
    borderRadius: 4,
    color: "rgba(0, 179, 142, .2)"
  }
})(Slider);

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

export const OrderFeedback: React.FC = (props) => {
  const classes = useStyles({});
  const [value, setValue] = React.useState(0);
  const mascotRef = useRef(null);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState<boolean>(false);
  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setValue(newValue);
  };

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <div>
            <Typography>{children}</Typography>
          </div>
        )}
      </div>
    );
  }

  function a11yProps(index: any) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`
    };
  }

  return (
    <div className={classes.root}>
      <Header/>
      <div className={classes.container}>
        <div className={classes.orderFeedbackContainer}>
          <Grid container spacing={2} className={classes.paymentContainer}>
            <Grid item xs={12} sm={8}>
              <div className={classes.sectionHeader}>
                <Typography component="h3">Your Orders</Typography>
              </div>
              <ul className={classes.orderList}>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li className={classes.orderSelected}>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p" className={classes.redText}>Return Rejected</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
                <li>
                  <div className={classes.order}>
                    <img src={require('images/ic_tablets.svg')} />
                    <div className={classes.orderContent}>
                      <Typography component="p">Medicine</Typography>
                      <div className={classes.orderDetails}>
                        <Typography component="p">Home Delivery</Typography>
                        <Typography component="p">#A2472707936</Typography>
                      </div>
                    </div>
                    <PrettoSlider className={classes.slider} valueLabelDisplay="auto" aria-label="pretto slider"
                                  defaultValue={20}/>
                    <div className={classes.orderPlacedContainer}>
                      <Typography component="p">Order Placed</Typography>
                      <Typography component="p">9 Aug 19, 12:00 pm</Typography>
                    </div>
                  </div>
                </li>
              </ul>
            </Grid>
            <Grid item xs={12} sm={4} className={classes.orderStatusContainer}>
              <Paper className={classes.paper}>
                <div className={classes.paperHeading}>
                  <Typography component="h3">Order Status</Typography>
                  <img src={require("images/menu.svg")} width="12"/>
                </div>
                <div className={classes.statusContainer}>
                  <Tabs value={value} className={classes.tabsContainer} onChange={handleChange}
                        aria-label="simple tabs example">
                    <Tab label="Track Order" className={classes.tab} {...a11yProps(0)} />
                    <Tab label="Order Summary" className={classes.tab} {...a11yProps(1)} />
                  </Tabs>

                  <TabPanel value={value} index={0}>
                    <div className={classes.tabPanel}>
                      <div className={classes.trackContent}>
                        <div className={classes.flex}>
                          <Typography component="h3">ORDER #A2472707936</Typography>
                          <Typography component="p" className={classes.statusTag}>Successful</Typography>
                        </div>
                        <Typography component="p"><span className={classes.fontBold}>Name: </span> Surj
                          Gupta</Typography>
                        <Typography component="p"><span className={classes.fontBold}>Address:</span> L-2/203, Gulmohar
                          Gardens, Raj Nagar Extension,
                          201017 </Typography>
                      </div>
                      <div className={classes.trackOrderContent}>
                        <div className={classes.orderStatus}>
                          <img src={require("images/notify.png")}/>
                          <Typography>EXPECTED DELIVERY - 9 Aug, 2019</Typography>
                        </div>
                        <ul className={classes.orderStages}>
                          <li className={classes.stageActive}>
                            <span className={` ${classes.stage} ${classes.stageCompleted}`}></span>
                            <div className={`${classes.tcCard} ${classes.tcCardActive} `}>
                              <Typography component="h3">OrderPlaced</Typography>
                              <div className={classes.flex}>
                                <Typography component="p">9 Aug 2019</Typography>
                                <Typography component="p">12:00 pm</Typography>
                              </div>
                            </div>
                            <p><span className={classes.blueText}> Verification Pending :</span> Your order is being
                              verified by our pharmacists. Our Pharmacists
                              might be required to call you for order
                              verification.</p>
                          </li>
                          <li>
                            <span className={classes.stage}></span>
                            <div className={classes.tcCard}>
                              <Typography component="h3">Order Verified</Typography>
                              <div className={classes.flex}>
                                <Typography component="p">9 Aug 2019</Typography>
                                <Typography component="p">12:30 pm</Typography>
                              </div>
                            </div>
                            <p><span className={classes.blueText}> Store Assigned:</span> Your order has been assigned
                              to our Pharmacy.</p>
                          </li>
                          <li>
                            <span className={classes.stage}></span>
                            <div className={classes.tcCard}>
                              <Typography component="h3">Order Billed &amp; Packed</Typography>
                              <div className={classes.flex}>
                                <Typography component="p">9 Aug 2019</Typography>
                                <Typography component="p">13:00 pm</Typography>
                              </div>
                            </div>
                            <p>Your order #A2472707936 has been
                              packed. Soon would be dispatched from our pharmacy. </p>
                          </li>
                          <li>
                            <span className={classes.stage}></span>
                            <div className={classes.tcCard}>
                              <Typography component="h3">Order Dispatched</Typography>
                              <div className={classes.flex}>
                                <Typography component="p">9 Aug 2019</Typography>
                                <Typography component="p">13:20 pm</Typography>
                              </div>
                            </div>
                            <p><span className={classes.blueText}> Out for delivery.</span> Your order #A2472707936
                              would be reaching your doorstep soon. </p>
                          </li>
                          <li>
                            <span className={classes.stage}></span>
                            <div className={classes.tcCard}>
                              <Typography component="h3">Order Delivered</Typography>
                              <div className={classes.flex}>
                                <Typography component="p">9 Aug 2019</Typography>
                                <Typography component="p">13:50 pm</Typography>
                              </div>
                            </div>
                          </li>
                        </ul>
                        <div className={classes.delivered}>
                          <Typography component="p">Your order no.#A2472707936 is successfully
                            delivered on 27 April 2020 at 13:57pm.</Typography>
                          <Typography component="h4">Thank You for choosing Apollo 24|7</Typography>
                          <Button color='primary' variant="contained" onClick={() => setIsPopoverOpen(true)}> Rate Your Delivery Experience</Button>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <div className={classes.tabPanel}>
                      <div className={classes.orderSummaryContainer}>
                        <div className={classes.summaryHeader}>
                          <Typography component="h3">ORDER #A2472707936</Typography>
                          <Typography component="p">Total <span className={classes.fontBold}> Rs.450</span></Typography>
                        </div>
                        <div className={classes.px14}>
                        <div className={classes.flex}>
                          <Typography component="p" className={classes.font10}>Order Placed</Typography>
                          <Typography component="p" className={classes.font10}>Payment Method</Typography>
                        </div>
                        <div className={classes.flex}>
                          <Typography component="p" className={`${classes.fontBold} ${classes.font10}`}>Tue, 27 April,
                            6:30PM</Typography>
                          <Typography component="p"
                                      className={`${classes.fontBold} ${classes.font10}`}>Prepaid</Typography>
                        </div>
                        </div>
                        <div className={classes.shippingDetails}>
                          <Typography component="h3">Shipping Address</Typography>
                          <div className={classes.px14}>
                          <Typography component="p"><span className={classes.fontBold}>Name: </span> Surj
                            Gupta</Typography>
                          <Typography component="p"><span className={classes.fontBold}>Address:</span> L-2/203, Gulmohar
                            Gardens, Raj Nagar Extension,201017</Typography>
                        </div>
                        </div>
                        <div className={classes.itemContainer}>
                          <div className={classes.itemHead}>
                            <Typography component="h3">Item Details</Typography>
                            <Typography component="p">Delivered Tue, 27 April</Typography>
                          </div>
                          <div className={classes.px14}>
                          <Typography component="p" className={classes.font10}><span className={classes.fontBold}>3 item(s)</span> in
                            shipment</Typography>
                          </div>
                          <div className={classes.itemContent}>
                          <div className={classes.flex}>
                            <Typography component="h3">Consult Detail</Typography>
                            <Typography component="h3">Qty</Typography>
                            <Typography component="h3">Charges</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p">Norflox - TZ (10 tabs)</Typography>
                            <Typography component="p">1</Typography>
                            <Typography component="p">Rs. 89</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p">Corex Cough Syrup</Typography>
                            <Typography component="p">1</Typography>
                            <Typography component="p">Rs. 139</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p">Metrogyl (30 tabs)</Typography>
                            <Typography component="p">1</Typography>
                            <Typography component="p">Rs. 38</Typography>
                          </div>
                        </div>
                        </div>
                        <div className={classes.paymentContent}>
                          <Typography component="h3">Payment Details</Typography>
                          <div className={classes.px14}>
                          <div className={classes.flex}>
                            <Typography component="p" className={classes.fontBold}>MRP Total</Typography>
                            <Typography component="p" className={classes.fontBold}>Rs. 300</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p" className={classes.fontBold}>Product Discount</Typography>
                            <Typography component="p" className={classes.fontBold}>- Rs. 90</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p" className={classes.fontBold}>Delivery Charges</Typography>
                            <Typography component="p" className={classes.fontBold}>+ Rs. 60</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p" className={classes.fontBold}>Packing Charges</Typography>
                            <Typography component="p" className={classes.fontBold}>+ Rs. 60</Typography>
                          </div>
                          <div className={`${classes.flex} ${classes.total}`}>
                            <Typography component="p" className={classes.fontBold}>Total</Typography>
                            <Typography component="p" className={classes.fontBold}>Rs. 270</Typography>
                          </div>
                          <div className={classes.flex}>
                            <Typography component="p" className={`${classes.font10} ${classes.p0}`}>Payment Method</Typography>
                            <Typography component="p" className={`${classes.font10} ${classes.p0}`}>Prepaid</Typography>
                          </div>
                        </div>
                        </div>
                      </div>
                      <div className={classes.summaryBottom}>
                        <Typography className={classes.font10}><span className={classes.fontBold}>Disclaimer:</span> Price may vary when the actual
                          bill
                          is generated.</Typography>
                        <div className={classes.btnContent}>
                          <Button variant="contained">Download</Button>
                          <Button variant="contained">Share</Button>
                        </div>
                      </div>
                    </div>
                  </TabPanel>
                </div>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
      <Popover
        open={isPopoverOpen}
        anchorEl={mascotRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        classes={{ paper: classes.bottomPopover }}
      >
        <div className={classes.feedbackPopoverWindow}>
          <div className={classes.windowWrap}>
            <div className={classes.mascotIcon}>
              <img src={require('images/ic-mascot.png')} alt="" />
            </div>
            <div className="feedbackContent">
            <Typography component="h3">We Value Your Feedback! :) </Typography>
            <Typography component="h4">How was your overall experience with the following medicine delivery —</Typography>
            <div className={classes.deliveryDetails}>
              <div className={classes.iconContainer}>
              <img src={require('images/ic_tablets.svg')} />
              </div>
              <div>
                <Typography component="h4">Medicines — #A2472707936 </Typography>
                <Typography component="p">Delivered On: 24 Oct 2019</Typography>
              </div>
            </div>
            <ul className={classes.feedbackList}>
              <li>
                <img src={require('images/ic-poor.png')} />
                Poor
              </li>
              <li>
                <img src={require('images/ic-okay.png')} />
                Okay
              </li>
              <li>
                <img src={require('images/ic-good.png')} />
                Good
              </li>
              <li>
                <img src={require('images/ic-great.png')} />
                Great
              </li>
            </ul>
            <div className={classes.suggestion}>
              <Typography component="h4">What can be improved?</Typography>
              <TextField className={classes.textInput} label="Write your suggestion here.." />
              <Button variant="contained">Submit Feedback</Button>
            </div>
            </div>
            <div className={classes.thankyou}>
              <Typography component="h3">We Value Your Feedback! :) </Typography>
              <Typography component="h4">How was your overall experience with the following medicine delivery —</Typography>
              <Link href="#">Ok, Got It</Link>
            </div>
          </div>
        </div>
      </Popover>
    </div>
  );
};
