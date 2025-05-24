<template>
  <div class="pt-4 md:m-10 md:p-10 w-full md:w-[90%]">
    <div class="w-full flex gap-10 bg-[#8a7ca92a] p-3 rounded-xl">
      <div class="flex flex-col items-center text-sm gap-2 text-center mt-2">
        <img :src="pfpUrl" class="w-20 h-20" />
        <p>{{ username }}</p>
      </div>
      <div class="flex-1">
        <p>Share your opinion on this recipe</p>
        <FormsRatingField
          v-model="userRating"
          :select="true"
          :star-size="18"
        ></FormsRatingField>
        <textarea
          v-model="userComment"
          class="bg-none mt-2 rounded-sm h-16 flex-grow p-1 border flex-wrap resize-none overflow-hidden leading-snug w-full sm:w-[75%]"
          rows="1"
          @input="autoResize($event)"
        />
      </div>
    </div>
    <div class="m-6 space-y-4">
      <div v-for="comment in comments" :key="comment.id">
        <PagesRecipeComment :comment="comment" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const username = 'Demo Danny';
const pfpUrl =
  'https://as1.ftcdn.net/v2/jpg/01/95/57/06/1000_F_195570681_6MwgykPMSlClarv0or2m3dBqQToCF0fB.jpg';
const userRating = ref(null);
const userComment = '';
const comments = ref([
  {
    id: 1,
    content: 'This recipe is fire!',
    created_at: '2025-05-23T10:00:00Z',
    user: { username: 'ChefMax', pfp: '/placeholder-user.jpg' },
    rating: 4.5,
    replies: [
      {
        id: 2,
        replying_to: 1,
        content: 'Totally agree!',
        created_at: '2025-05-23T10:10:00Z',
        user: { username: 'SpiceGirl', pfp: '/placeholder-user.jpg' },
      },
      {
        id: 3,
        replying_to: 1,
        content: 'Worked great for my dinner party.',
        created_at: '2025-05-23T10:20:00Z',
        user: { username: 'PartyKing', pfp: '/placeholder-user.jpg' },
      },
    ],
  },
  {
    id: 4,
    content: 'Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?Too salty, any tips?',
    created_at: '2025-05-23T11:00:00Z',
    user: { username: 'HealthFan', pfp: '/placeholder-user.jpg' },
    rating: 3.0,
    replies: [
      {
        id: 5,
        replying_to: 4,
        content: 'Try low-sodium broth!',
        created_at: '2025-05-23T11:10:00Z',
        user: { username: 'SaltHacker', pfp: '/placeholder-user.jpg' },
      },
    ],
  },
]);

function autoResize(event) {
  const textarea = event.target;
  textarea.style.height = '64px'; // Reset height
  if (textarea.scrollHeight > 64) {
    textarea.style.height = textarea.scrollHeight + 'px'; // Set to scroll height
  } else {
    textarea.style.height = 64 + 'px';
  }
}
</script>

<style scoped></style>
