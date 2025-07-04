import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { UserType } from 'src/types/types'

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Login: undefined
      Register: undefined
      AppTabs: {
        user: UserType
        token: string
      }
      Disciplina: {
        user: UserType
        disciplina: {
          id: number
          nome: string
          semestre: string
        }
        token: string
      }
      Profile: {
        user: UserType
        token: string
      }
      ForgotPassword: undefined
    }
  }
}

export type HomeScreenProps = NativeStackScreenProps<RootParamList, 'Home'>
