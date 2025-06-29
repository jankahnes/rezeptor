<template>
  <div
    class="p-6 w-full max-w-110 shadow-lg rounded-md border-2 relative h-max text-[14px] mx-auto"
  >
    <div
      class="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 border-1 bg-main rounded-full shadow-sm pin"
    ></div>
    <div class="flex gap-4 w-full">
      <span class="flex items-start min-w-10">
        <img
          v-if="comment.user.picture_url"
          :src="comment.user.picture_url"
          class="w-10 h-10 rounded-full shadow-lg"
        />
        <div v-else class="w-10 h-10 rounded-full bg-gray-300 shadow-lg">
          {{
            comment.user.username.charAt(0).toUpperCase() +
            comment.user.username.charAt(1).toUpperCase()
          }}
        </div>
      </span>
      <div class="flex-1 w-full min-w-0">
        <div class="flex justify-between w-full items-center">
          <span class="text-lg text-wrap">{{
            comment.user.username
          }}</span>
          <span class="text-[10px] text-gray-500">{{
            timeAgo(comment.created_at)
          }}</span>
        </div>
        <FormsRatingField
          v-if="comment.rating"
          class="opacity-70"
          v-model="comment.rating"
          :select="false"
          :starWidth="14"
          :starHeight="14"
        />
        <div
          class="mt-1 overflow-hidden break-words"
          v-if="!isEditing(comment.id)"
        >
          {{ comment.content }}
        </div>
        <div class="mt-1 w-full" v-else>
          <textarea
            v-model="edits.find((edit) => edit.id === comment.id).content"
            v-auto-resize
            class="w-full p-2 rounded-md border-2 border-gray-300 border-dashed resize-none bg-white overflow-hidden h-auto break-words scrollbar-hide"
            rows="1"
          ></textarea>
          <div class="flex justify-between mt-1">
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
              @click="edits.splice(edits.indexOf(comment.id), 1)"
            >
              Cancel
            </button>
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
              @click="confirmEdit(comment.id)"
            >
              Save
            </button>
          </div>
        </div>
        <div
          v-if="!isEditing(comment.id)"
          class="flex gap-2 mt-1 text-gray-500"
        >
          <div
            v-if="auth.user && !replying"
            class="text-[10px] cursor-pointer select-none"
            @click="replying = true"
          >
            Add Reply
          </div>
          <div
            v-if="auth.user.id == comment.user.id"
            class="text-[10px] cursor-pointer select-none"
            @click="startEdit(comment.id, comment.content)"
          >
            · Edit
          </div>
          <div
            v-if="auth.user.id == comment.user.id"
            class="text-[10px] cursor-pointer select-none"
            @click="deleteComment(comment.id)"
          >
            · Delete
          </div>
        </div>
        <div class="replies mt-2" v-if="comment.replies?.length && !replying">
          <div
            class="flex gap-4 p-2 pl-4 border-l-2 border-gray-300 border-dashed"
            v-for="reply in paginatedReplies"
          >
            <span class="flex items-start min-w-10">
              <img
                v-if="reply.user.picture_url"
                :src="reply.user.picture_url"
                class="w-10 h-10 rounded-full shadow-lg"
              />
              <div v-else class="w-10 h-10 rounded-full bg-gray-300 shadow-lg">
                {{
                  reply.user.username.charAt(0).toUpperCase() +
                  reply.user.username.charAt(1).toUpperCase()
                }}
              </div>
            </span>
            <div class="flex-1">
              <div class="flex justify-between w-full items-center">
                <span class="text-lg text-wrap">{{
                  reply.user.username
                }}</span>
                <span class="text-[10px] text-gray-500">{{
                  timeAgo(reply.created_at)
                }}</span>
              </div>
              <div
                class="text-[14px] mt-1 overflow-x-hidden"
                v-if="!isEditing(reply.id)"
              >
                {{ reply.content }}
              </div>
              <div class="text-[14px] mt-1" v-if="isEditing(reply.id)">
                <textarea
                  v-model="edits.find((edit) => edit.id === reply.id).content"
                  v-auto-resize
                  class="w-full p-2 rounded-md border-2 border-gray-300 border-dashed resize-none scrollbar-hide bg-white overflow-hidden h-auto break-words"
                  rows="1"
                ></textarea>
                <div class="flex justify-between mt-1">
                  <button
                    class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
                    @click="edits.splice(edits.indexOf(reply.id), 1)"
                  >
                    Cancel
                  </button>
                  <button
                    class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
                    @click="confirmEdit(reply.id)"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div
                v-if="!isEditing(reply.id)"
                class="flex gap-2 mt-1 text-gray-500"
              >
                <div
                  v-if="auth.user.id == reply.user.id"
                  class="text-[10px] cursor-pointer select-none"
                  @click="startEdit(reply.id, reply.content)"
                >
                  Edit
                </div>
                <div
                  v-if="auth.user.id == reply.user.id"
                  class="text-[10px] cursor-pointer select-none"
                  @click="deleteComment(reply.id)"
                >
                  · Delete
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex justify-center gap-4 mt-2 items-center text-gray-500 text-sm"
            v-if="totalPages > 1"
          >
            <button
              class="p-1 rounded hover:text-black"
              @click="currentPage--"
              :disabled="currentPage === 1"
            >
              <span class="material-symbols-outlined !text-base">
                arrow_back_ios
              </span>
            </button>
            <span class="text-sm text-black"
              >{{ currentPage }} / {{ totalPages }}</span
            >
            <button
              class="p-1 rounded hover:text-black"
              @click="currentPage++"
              :disabled="currentPage === totalPages"
            >
              <span class="material-symbols-outlined !text-base">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </div>
        <div class="mt-2" v-if="replying">
          <textarea
            v-model="replyContent"
            v-auto-resize
            class="w-full p-2 rounded-md border-2 border-gray-300 border-dashed resize-none scrollbar-hide bg-white overflow-hidden h-auto break-words"
            rows="1"
          ></textarea>
          <div class="flex justify-between mt-1">
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30"
              @click="replying = false"
            >
              Cancel
            </button>
            <button
              class="py-1 px-2 bg-white text-[#FF6900] border-2 border-[#FF6900] rounded-md hover:bg-[#faf4f0] transform transition-all duration-100 focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 shadow-lg shadow-orange-200/30 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="submitReply"
              :disabled="!replyContent"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  comment: Object,
  bgColor: String,
});

const randomSeed = (Math.random() - 0.5) * 2;

const auth = useAuthStore();
const recipe = useCurrentRecipeStore();

const replyContent = ref('');
const replying = ref(false);
const currentPage = ref(1);
const repliesPerPage = 3;
const edits = ref([]);

const totalPages = computed(() => {
  if (!props.comment.replies?.length) return 0;
  return Math.ceil(props.comment.replies.length / repliesPerPage);
});

const paginatedReplies = computed(() => {
  if (!props.comment.replies?.length) return [];
  const start = (currentPage.value - 1) * repliesPerPage;
  const end = start + repliesPerPage;
  return props.comment.replies.slice(start, end);
});

function submitReply() {
  const comment = {
    user_id: auth.user.id,
    replying_to: props.comment.id,
    content: replyContent.value,
    user: auth.user,
    created_at: new Date().toISOString(),
  };
  recipe.addNewComment(comment);
  replyContent.value = '';
  replying.value = false;
}

function confirmEdit(id) {
  recipe.editCommentById(
    id,
    edits.value.find((edit) => edit.id === id).content
  );
  edits.value.splice(edits.value.indexOf(id), 1);
}

function deleteComment(id) {
  recipe.deleteCommentById(id);
}

function startEdit(id, content) {
  edits.value.push({
    id: id,
    content: content,
  });
}

function isEditing(id) {
  return edits.value.some((edit) => edit.id === id);
}
</script>

<style scoped></style>
