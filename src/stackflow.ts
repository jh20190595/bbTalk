import { lazy } from 'react'
import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { historySyncPlugin } from '@stackflow/plugin-history-sync'

const PostListActivity = lazy(() => import('@/activities/PostListActivity'))
const PostDetailActivity = lazy(() => import('@/activities/PostDetailActivity'))
const PostCreateActivity = lazy(() => import('@/activities/PostCreateActivity'))
const LoginActivity = lazy(() => import('@/activities/LoginActivity'))
const ProfileSetupActivity = lazy(() => import('@/activities/ProfileSetupActivity'))
const KboCalendarActivity = lazy(() => import('@/activities/KboCalendarActivity'))
const MyTeamPostsActivity = lazy(() => import('@/activities/MyTeamPostsActivity'))
const GameRecordActivity = lazy(() => import('@/activities/GameRecordActivity'))
const MyPageActivity = lazy(() => import('@/activities/MyPageActivity'))

export const { Stack, useFlow } = stackflow({
  transitionDuration: 350,
  plugins: [
    basicRendererPlugin(),
    historySyncPlugin({
      routes: {
        PostListActivity: '/',
        PostCreateActivity: '/posts/create',
        PostDetailActivity: '/posts/:id',
        LoginActivity: '/login',
        ProfileSetupActivity: '/profile/setup',
        KboCalendarActivity: '/kbo/calendar',
        MyTeamPostsActivity: '/my-team',
        GameRecordActivity: '/record',
        MyPageActivity: '/mypage',
      },
      fallbackActivity: () => 'PostListActivity',
    }),
  ],
  activities: {
    PostListActivity,
    PostCreateActivity,
    PostDetailActivity,
    LoginActivity,
    ProfileSetupActivity,
    KboCalendarActivity,
    MyTeamPostsActivity,
    GameRecordActivity,
    MyPageActivity,
  },
})
