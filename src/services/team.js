import { axiosInstance } from '@services/axiosInstance';
import { referenceId } from '@utils/format';

// Fields the backend owns. They come back on every response and echoing any of
// them on a write is wrong, so they are stripped rather than trusted.
const SERVER_OWNED = ['createdBy', 'createdAt', 'updatedAt', '__v', '_id'];

export async function createTeam({ name, department, teamLead = null }) {
  const { data } = await axiosInstance.post('/team', {
    name: String(name ?? '').trim(),
    department: referenceId(department),
    teamLead: referenceId(teamLead),
  });
  return data;
}

// Unlike /department, this endpoint filters server-side — so filters go over
// the wire rather than being applied to a full list on the client.
export async function listTeams(filters = {}) {
  const params = {};

  if (filters.department) params.department = referenceId(filters.department);
  if (filters.teamLead) params.teamLead = referenceId(filters.teamLead);
  if (filters.status) params.status = filters.status;

  const { data } = await axiosInstance.get('/team', { params });
  return data;
}

export async function getTeamById(id) {
  const { data } = await axiosInstance.get(`/team/${id}`);
  return data;
}

export async function updateTeam(id, changes) {
  const payload = { ...changes };

  SERVER_OWNED.forEach((field) => delete payload[field]);

  // Status has its own endpoint. Accepting it here would give two routes to
  // one change, only one of them documented.
  delete payload.status;

  if (payload.name !== undefined) payload.name = String(payload.name).trim();

  // Both arrive populated on reads and must go back as ids. An explicit null
  // must survive: clearing the team lead is a real operation.
  if ('department' in payload) payload.department = referenceId(payload.department);
  if ('teamLead' in payload) payload.teamLead = referenceId(payload.teamLead);

  const { data } = await axiosInstance.patch(`/team/${id}`, payload);
  return data;
}

export async function updateTeamStatus(id, status) {
  const { data } = await axiosInstance.patch(`/team/${id}/status`, { status });
  return data;
}

// SUPER_ADMIN only. A TEAM_LEAD may do everything else to a team but 403s
// here, and the login response carries no level to anticipate it with.
export async function deleteTeam(id) {
  const { data } = await axiosInstance.delete(`/team/${id}`);
  return data;
}
