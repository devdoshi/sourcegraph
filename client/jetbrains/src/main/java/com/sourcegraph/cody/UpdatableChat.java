package com.sourcegraph.cody;

import com.sourcegraph.cody.chat.ChatMessage;
import com.sourcegraph.cody.context.ContextMessage;
import java.util.List;
import org.jetbrains.annotations.NotNull;

public interface UpdatableChat {
  void addMessageToChat(@NotNull ChatMessage message);

  void respondToMessage(@NotNull ChatMessage message, @NotNull String responsePrefix);

  void respondToErrorFromServer(@NotNull String errorMessage);

  void updateLastMessage(@NotNull ChatMessage message);

  void displayUsedContext(@NotNull List<ContextMessage> contextMessages);

  void finishMessageProcessing();

  void resetConversation();

  void refreshPanelsVisibility();

  boolean isChatVisible();

  void activateChatTab();
}
