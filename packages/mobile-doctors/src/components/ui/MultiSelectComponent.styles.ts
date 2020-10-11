import { StyleSheet } from 'react-native';

import { theme } from '@aph/mobile-doctors/src/theme/theme';
import { colors } from '@aph/mobile-doctors/src/theme/colors';

export default StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20
    },
    itemText: {
        color: colors.LIGHT_BLUE,
        ...theme.fonts.IBMPlexSansMedium(14),
        marginLeft: 16,
        flex: 1
    }
});
