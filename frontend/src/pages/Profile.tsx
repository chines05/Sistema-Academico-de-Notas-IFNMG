import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Toast from 'react-native-toast-message'
import api from 'src/utils/api'
import { colors } from 'src/utils/colors'
import Input from 'src/components/Input'
import {
  profileSchema,
  ProfileFormData,
  passwordSchema,
  PasswordFormData,
} from 'src/schemas/profileSchema'
import Header from 'src/components/Header'
import { DisciplinaRouteParamsType } from 'src/types/types'

const Profile = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { user: initialUser, token } = route.params as DisciplinaRouteParamsType
  const [editingName, setEditingName] = useState(false)
  const [editingPassword, setEditingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(initialUser)

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nome: user.nome,
    },
  })

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPasswordForm,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const handleLogout = async () => {
    try {
      const response = await api.post(
        '/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      })

      Toast.show({
        type: 'success',
        text1: response.data?.message || 'Você saiu da sua conta',
      })
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Erro ao sair da conta',
      })
    }
  }

  const updateProfileNome = async (data: ProfileFormData) => {
    setLoading(true)
    try {
      const response = await api.put(
        `/change-name`,
        {
          name: data.nome,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const usuarioAtualizado = { ...user, nome: data.nome }
      setUser(usuarioAtualizado)

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AppTabs',
            params: { user: usuarioAtualizado, token },
          },
        ],
      })

      Toast.show({
        type: 'success',
        text1: response.data?.message || 'Perfil atualizado com sucesso!',
      })
      setEditingName(false)
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Erro ao atualizar perfil',
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (data: PasswordFormData) => {
    setLoading(true)
    try {
      const response = await api.put(
        `/change-password`,
        {
          current_password: data.senhaAtual,
          new_password: data.novaSenha,
          new_password_confirmation: data.confirmarSenha,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      Toast.show({
        type: 'success',
        text1: response.data.message || 'Senha alterada com sucesso!',
      })

      setEditingPassword(false)
      resetPasswordForm()
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: error.response?.data?.message || 'Erro ao alterar senha',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header title="Meu Perfil" />

        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons
              name="person-circle-outline"
              size={100}
              color={colors.verde}
            />
          </View>

          {!editingName ? (
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{user.nome}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingName(true)}
              >
                <Ionicons name="pencil" size={16} color={colors.verde} />
                <Text style={styles.editButtonText}>Editar nome</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <Controller
                control={profileControl}
                name="nome"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Nome completo"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={profileErrors.nome}
                    autoCapitalize="words"
                  />
                )}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setEditingName(false)}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleProfileSubmit(updateProfileNome)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.detailItem}>
            <Ionicons name="mail-outline" size={20} color={colors.verde} />
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          <View style={styles.detailItem}>
            <Ionicons name="id-card-outline" size={20} color={colors.verde} />
            <Text style={styles.detailText}>Matrícula: {user.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Segurança</Text>

          {!editingPassword ? (
            <TouchableOpacity
              style={styles.securityButton}
              onPress={() => setEditingPassword(true)}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={colors.verde}
              />
              <Text style={styles.securityButtonText}>Alterar senha</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Controller
                control={passwordControl}
                name="senhaAtual"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Senha atual"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={passwordErrors.senhaAtual}
                    icon="lock-closed-outline"
                  />
                )}
              />
              <Controller
                control={passwordControl}
                name="novaSenha"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Nova senha"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={passwordErrors.novaSenha}
                    icon="lock-closed-outline"
                  />
                )}
              />
              <Controller
                control={passwordControl}
                name="confirmarSenha"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    placeholder="Confirmar nova senha"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={passwordErrors.confirmarSenha}
                    icon="lock-closed-outline"
                  />
                )}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setEditingPassword(false)
                    resetPasswordForm()
                  }}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handlePasswordSubmit(updatePassword)}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Salvar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.vermelho} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 50,
    paddingBottom: 30,
  },
  profileSection: {
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.verdeEscuro,
    marginBottom: 10,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  editButtonText: {
    color: colors.verde,
    marginLeft: 5,
    fontWeight: '500',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
    paddingHorizontal: 20,
  },
  detailText: {
    marginLeft: 10,
    color: '#555',
    fontSize: 16,
  },
  section: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.verdeEscuro,
    marginBottom: 20,
  },
  securityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  securityButtonText: {
    flex: 1,
    marginLeft: 10,
    color: '#333',
    fontSize: 16,
  },
  formContainer: {
    marginTop: 10,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    width: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: colors.verde,
  },
  cancelButton: {
    backgroundColor: colors.vermelho,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 25,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.vermelho,
  },
  logoutText: {
    color: colors.vermelho,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

export default Profile
