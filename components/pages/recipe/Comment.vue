<template>
  <div class="flex gap-3">
    <div class="w-14 flex-shrink-0 flex flex-col items-center">
      <img :src="comment.user.picture_url" class="w-14 h-14" />
    </div>

    <div class="flex-1">
      <p class="text-sm text-gray-500">
        <span class="font-bold">{{ comment.user.username }} · </span
        >{{ timeAgo(comment.created_at) }}
      </p>
      <FormsRatingField
        v-if="comment.rating && !isReply"
        class="opacity-70"
        v-model="comment.rating"
        :select="false"
        :starWidth="18"
        :starHeight="18"
        :id="100"
      ></FormsRatingField>
      <p class="text-base text-gray-800">{{ comment.content }}</p>

      <div class="flex justify-between">
        <button
          v-if="auth.user && !replying"
          class="text-xs text-blue-500 mt-1"
          @click="replying = !replying"
        >
          Reply
        </button>
        <button
          v-if="auth.user?.id === comment.user.id"
          class="text-xs text-blue-500 mt-1"
          @click="confirmDeleteComment"
        >
          Delete
        </button>
      </div>
      <div v-if="replying" class="mt-2">
        <textarea
          rows="1"
          placeholder="Write a reply..."
          class="w-full p-1 text-sm border rounded resize-none"
          @input="autoResize"
          v-model="replyContent"
        />
        <div class="flex gap-2">
          <button class="mt-1 text-xs text-green-600" @click="replying = false">
            Cancel
          </button>
          <button
            v-if="replyContent"
            class="mt-1 text-xs text-green-600"
            @click="submitReply"
          >
            Submit
          </button>
        </div>
      </div>

      <!-- Replies block -->
      <div
        v-if="comment.replies?.length"
        class="mt-3 border-l-2 border-gray-300 -ml-8 sm:ml-0 pl-4 space-y-2 relative"
      >
        <button
          v-if="showReplies"
          @click="showReplies = !showReplies"
          class="absolute left-[-10px] top-0 h-full w-2 bg-transparent hover:cursor-pointer"
          aria-label="Toggle replies"
        ></button>

        <div v-if="showReplies" class="space-y-2">
          <PagesRecipeComment
            v-for="reply in comment.replies"
            :key="reply.id"
            :comment="reply"
            :isReply="true"
            :removeFunction="removeFunction"
          />
        </div>
        <button
          v-else
          class="border h-5 aspect-square flex items-center justify-center"
          @click="showReplies = true"
        >
          <span class="material-symbols-outlined !text-sm"> add </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  comment: Object,
  removeFunction: Function,
  isReply: Boolean,
});

const auth = useAuthStore();

const replyContent = ref('');

const replying = ref(false);
const showReplies = ref(true);

function autoResize(e) {
  e.target.style.height = 'auto';
  e.target.style.height = e.target.scrollHeight + 'px';
}

function submitReply() {
  const comment = {
    user_id: auth.user.id,
    recipe_id: props.comment.recipe_id,
    replying_to: props.comment.id,
    parent: props.comment,
    content: replyContent.value,
    user: auth.user,
    created_at: new Date().toISOString(),
  };
  if (props.isReply) {
    comment.replying_to = props.comment.replying_to;
  }
  if (props.isReply) {
    comment.replying_to = props.comment.replying_to;
    props.comment.parent.replies.push(comment);
  } else {
    props.comment.replies.push(comment);
  }
  replyContent.value = '';
  replying.value = false;
  addComment(comment, false).then((id) => {
    comment.id = id;
  });
}

function confirmDeleteComment() {
  deleteComment(props.comment);
  props.removeFunction(props.comment.id);
}
</script>
