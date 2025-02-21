// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import type {Dispatch} from 'redux';

import {
    canManageAnyChannelMembersInCurrentTeam,
    getCurrentChannelId,
    getChannelByName,
    getChannelMember,
} from 'mattermost-redux/selectors/entities/channels';
import {getCallsConfig, getProfilesInCalls} from 'mattermost-redux/selectors/entities/common';
import {getTeammateNameDisplaySetting} from 'mattermost-redux/selectors/entities/preferences';
import {
    getCurrentTeam,
    getCurrentRelativeTeamUrl,
    getTeamMember,
} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentTimezone} from 'mattermost-redux/selectors/entities/timezone';
import {displayLastActiveLabel, getCurrentUserId, getLastActiveTimestampUnits, getLastActivityForUserId, getStatusForUserId, getUser} from 'mattermost-redux/selectors/entities/users';

import {openDirectChannelToUserId} from 'actions/channel_actions';
import {closeModal, openModal} from 'actions/views/modals';
import {getMembershipForEntities} from 'actions/views/profile_popover';
import {isCallsEnabled} from 'selectors/calls';
import {getRhsState, getSelectedPost} from 'selectors/rhs';
import {getIsMobileView} from 'selectors/views/browser';
import {makeGetCustomStatus, isCustomStatusEnabled, isCustomStatusExpired} from 'selectors/views/custom_status';
import {isAnyModalOpen} from 'selectors/views/modals';

import {getDirectChannelName} from 'utils/utils';

import type {GlobalState} from 'types/store';

import ProfilePopover from './profile_popover';

type OwnProps = {
    userId: string;
    channelId?: string;
}

function getDefaultChannelId(state: GlobalState) {
    const selectedPost = getSelectedPost(state);
    return selectedPost.exists ? selectedPost.channel_id : getCurrentChannelId(state);
}

export function checkUserInCall(state: GlobalState, userId: string) {
    for (const profilesMap of Object.values(getProfilesInCalls(state))) {
        for (const profile of Object.values(profilesMap || {})) {
            if (profile?.id === userId) {
                return true;
            }
        }
    }

    return false;
}

function makeMapStateToProps() {
    const getCustomStatus = makeGetCustomStatus();

    return (state: GlobalState, {userId, channelId = getDefaultChannelId(state)}: OwnProps) => {
        const team = getCurrentTeam(state);
        const teamMember = getTeamMember(state, team.id, userId);

        const isTeamAdmin = Boolean(teamMember && teamMember.scheme_admin);
        const channelMember = getChannelMember(state, channelId, userId);

        let isChannelAdmin = false;
        if (getRhsState(state) !== 'search' && channelMember != null && channelMember.scheme_admin) {
            isChannelAdmin = true;
        }

        const customStatus = getCustomStatus(state, userId);
        const status = getStatusForUserId(state, userId);
        const user = getUser(state, userId);

        const lastActivityTimestamp = getLastActivityForUserId(state, userId);
        const timestampUnits = getLastActiveTimestampUnits(state, userId);
        const enableLastActiveTime = displayLastActiveLabel(state, userId);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const callsEnabled = isCallsEnabled(state);
        const currentUserId = getCurrentUserId(state);
        const callsConfig = callsEnabled ? getCallsConfig(state) : undefined;

        return {
            currentTeamId: team.id,
            currentUserId,
            isTeamAdmin,
            isChannelAdmin,
            isInCurrentTeam: Boolean(teamMember) && teamMember?.delete_at === 0,
            canManageAnyChannelMembersInCurrentTeam: canManageAnyChannelMembersInCurrentTeam(state),
            status,
            teamUrl: getCurrentRelativeTeamUrl(state),
            user,
            modals: state.views.modals,
            customStatus,
            isCustomStatusEnabled: isCustomStatusEnabled(state),
            isCustomStatusExpired: isCustomStatusExpired(state, customStatus),
            channelId,
            currentUserTimezone: getCurrentTimezone(state),
            lastActivityTimestamp,
            enableLastActiveTime,
            timestampUnits,
            isMobileView: getIsMobileView(state),
            isCallsEnabled: callsEnabled,
            isUserInCall: callsEnabled ? checkUserInCall(state, userId) : undefined,
            isCurrentUserInCall: callsEnabled ? checkUserInCall(state, currentUserId) : undefined,
            isCallsDefaultEnabledOnAllChannels: callsConfig?.DefaultEnabled,
            isCallsCanBeDisabledOnSpecificChannels: callsConfig?.AllowEnableCalls,
            dMChannel: getChannelByName(state, getDirectChannelName(currentUserId, userId)),
            teammateNameDisplay: getTeammateNameDisplaySetting(state),
            isAnyModalOpen: isAnyModalOpen(state),
        };
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        actions: bindActionCreators({
            closeModal,
            openDirectChannelToUserId,
            openModal,
            getMembershipForEntities,
        }, dispatch),
    };
}

export default connect(makeMapStateToProps, mapDispatchToProps)(ProfilePopover);
