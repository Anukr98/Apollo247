import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Tabs, Tab } from '@material-ui/core';
import { Header } from 'components/Header';
import { MyProfile } from 'components/MyAccount/MyProfile';

const useStyles = makeStyles((theme: Theme) => {
    return {
        oamContainer: {},
        container: {
            maxWidth: 1064,
            margin: 'auto',
        },
        oamContent: {
            display: 'flex',
            alignItems: 'flex-start',
            padding: 20,
            background: '#F7F8F5'
        },
        leftSection: {
            width: '40%',
            maxWidth: 320,
        },
        rightSection: {
            padding: '0 0 0 15px',
            width: '60%'
        },
        membershipContainer: {
            background: '#fff',
            borderRadius: 5,
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            width: '100%'
        },
        membershipCardContainer: {},
        membershipCard: {
            background: 'url(images/membership-bg.svg) no-repeat 0 0',

        },
        membershipContent: {},
        tabsRoot: {
            borderBottom: '0.5px solid rgba(2,71,91,0.3)',
            [theme.breakpoints.down('xs')]: {
                marginLeft: 0,
                marginRight: 0,
                backgroundColor: '#f7f8f5',
            },
        },
        tabRoot: {
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            padding: '11px 32px',
            color: '#658f9b',
            opacity: 1,
            textTransform: 'none',
        },
        tabSelected: {
            color: '#02475b',
        },
        tabsIndicator: {
            backgroundColor: '#00b38e',
            height: 5,
        },
        rootTabContainer: {
            padding: 0,
        },
    };
});

const TabContainer: React.FC = (props) => {
    return <Typography component="div">{props.children}</Typography>;
};

export const OneApolloMembership: React.FC = () => {
    const classes = useStyles({});
    const [tabValue, setTabValue] = useState<number>(0);
    return (
        <div className={classes.oamContainer}>
            <Header />
            <div className={classes.container}>
                <div className={classes.oamContent}>
                    <div className={classes.leftSection}>
                        <MyProfile />
                    </div>
                    <div className={classes.rightSection}>
                        <div className={classes.membershipContainer}>
                            <div className={classes.membershipCardContainer}>
                                <div className={classes.membershipCard}>

                                </div>
                            </div>
                            <div className={classes.membershipContent}>
                                <Tabs
                                    value={tabValue}
                                    classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                                    onChange={(e, newValue) => {
                                        setTabValue(newValue);
                                    }}
                                >
                                    <Tab
                                        classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                                        label={`My Membership`}
                                        value={0}
                                    />
                                    <Tab
                                        classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                                        label={`My Transcations`}
                                        value={1}
                                    />
                                </Tabs>

                                {tabValue === 0 && (
                                    <TabContainer>
                                        My Membership
                                    </TabContainer>
                                )}
                                {tabValue === 1 && (
                                    <TabContainer>
                                        My Transcations
                                    </TabContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}