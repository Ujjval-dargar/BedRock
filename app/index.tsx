import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check if user is authenticated
  // For now, redirect to welcome screen for authentication flow
  return <Redirect href="/welcome" />;
}
