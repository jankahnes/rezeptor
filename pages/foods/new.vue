<template>
  <div class="mx-auto max-w-screen-md p-6">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Can't find a generic food?
      </h1>
      <p class="text-gray-600 mt-2">
        Request it here and we'll add it to the database.
      </p>
    </div>

    <div class="bg-white rounded-2xl shadow-main p-4 sm:p-8">
      <div class="flex gap-4 items-center justify-center flex-col md:flex-row">
        <div class="flex-1">
          <div class="relative">
            <span
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 material-symbols-outlined"
            >
              grocery
            </span>
            <input
              v-model="foodName"
              type="text"
              placeholder="Enter food name..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>
        <button
          @click="requestFood()"
          :disabled="!foodName"
          class="relative px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ai-gradient"
        >
          Request
        </button>
      </div>
    </div>
    <button
      @click="seeActiveRequests()"
      class="button mt-4 px-4 py-2 flex items-center gap-2"
    >
      <ClientOnly>
        <Vue3Lottie
          v-if="requestsStore.requestsLoading"
          animationLink="/loading-alt.json"
          class="flex items-center justify-center"
          :height="20"
          :width="20"
          :scale="3"
        />
      </ClientOnly>
      See recent requests
    </button>
    <div
      v-if="requestsStore.requestsOpen"
      class="mt-4 bg-white rounded-2xl shadow-main p-4 sm:p-8 space-y-4"
    >
      <div
        v-for="request in requestsStore.requests"
        :key="request.id"
        class="flex items-center justify-between"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined"> grocery </span>
          {{ request.food_name }}
        </div>
        <div class="flex items-center gap-2">
          <ClientOnly v-if="request.status === 'PROCESSING'">
            <Vue3Lottie
              animationLink="/loading-alt.json"
              class="flex items-center justify-center"
              :height="30"
              :width="30"
              :scale="4"
            />
          </ClientOnly>
          <NuxtLink
            v-else-if="request.status === 'CLOSED_INSERTED'"
            :to="`/foods/${request.new_food_id}`"
            class="button flex items-center gap-2 px-4 py-2 rounded-lg !bg-green-200 text-gray-700"
          >
            <span class="material-symbols-outlined"> open_in_new </span>
            Accepted
          </NuxtLink>
          <span
            v-else
            :class="`material-symbols-outlined ${getStatusIcon(
              request.status
            )}`"
          ></span>
          <span v-else>{{ getStatusString(request.status) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define interface for food request
interface FoodRequest {
  id: string | number;
  food_name: string;
  status: 'OPEN' | 'PROCESSING' | 'CLOSED_INSERTED' | 'CLOSED_NOT_INSERTED';
  new_food_id?: number;
  status_info?: string;
  created_at?: string;
}

// Define API response interface
interface APIResponse {
  status: 'ok';
  data: {
    new_food_id: number;
    status: 'CLOSED_INSERTED';
  };
}

const foodName = ref('');
const supabase = useSupabaseClient();
const requestsStore = useRequestsStore();

const getStatusString = (status: string) => {
  if (status === 'CLOSED_INSERTED') return 'Accepted';
  if (status === 'CLOSED_NOT_INSERTED') return 'Rejected';
  if (status === 'PROCESSING') return 'Processing';
  if (status === 'OPEN') return 'Open';
  return status;
};

const getStatusIcon = (status: string) => {
  if (status === 'CLOSED_INSERTED') return 'check_circle';
  if (status === 'CLOSED_NOT_INSERTED') return 'cancel';
  if (status === 'PROCESSING') return 'hourglass_full';
  if (status === 'OPEN') return 'hourglass_empty';
  return 'hourglass_empty';
};

const requestFood = async () => {
  if (requestsStore.requestsOpen) {
    const newRequest: FoodRequest = {
      id: 'new',
      food_name: foodName.value,
      status: 'PROCESSING',
    };
    requestsStore.requests.unshift(newRequest);
  }

  try {
    const response = await $fetch<APIResponse>('/api/db/on-request-insert', {
      method: 'POST',
      body: {
        food_name: foodName.value,
      },
    });

    const requestIndex = requestsStore.requests.findIndex(
      (request: FoodRequest) => request.id === 'new'
    );
    if (response.status === 'ok' && requestIndex !== -1) {
      requestsStore.requests[requestIndex].status = 'CLOSED_INSERTED';
      requestsStore.requests[requestIndex].new_food_id =
        response.data.new_food_id;
    }
  } catch (error: any) {
    // Handle the error case - API throws error instead of returning error response
    const requestIndex = requestsStore.requests.findIndex(
      (request: FoodRequest) => request.id === 'new'
    );
    if (requestIndex !== -1) {
      requestsStore.requests[requestIndex].status = 'CLOSED_NOT_INSERTED';
      requestsStore.requests[requestIndex].status_info =
        error.data?.status_info || error.message || 'Unknown error';
    }
  }

  foodName.value = '';
};

const seeActiveRequests = async () => {
  if (requestsStore.requestsOpen) requestsStore.requestsOpen = false;
  else {
    requestsStore.requestsLoading = true;
    const { data, error } = await supabase
      .from('food_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) {
      console.error(error);
    } else {
      requestsStore.requests = data;
      requestsStore.requestsOpen = true;
    }
    requestsStore.requestsLoading = false;
  }
};
</script>

<style scoped></style>
